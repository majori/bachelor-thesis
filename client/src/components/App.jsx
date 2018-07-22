import _ from 'lodash';
import math from 'mathjs';
import qs from 'qs';
import React from 'react';
import styled from 'styled-components';
import Controls from './Controls';
import Stats from './Stats';

const Layout = styled.div`
  .pure-g {
    justify-content: center;
  }

  .stats {
    margin-bottom: 40px;
  }

  hr {
    width: 50%;
  }
`;

const statsInitState = {
  http1: {
    running: false,
    progress: 0,
    mean: null,
    deviation: null,
    min: null,
    max: null,
  },
  http2: {
    running: false,
    progress: 0,
    mean: null,
    deviation: null,
    min: null,
    max: null,
  },
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      params: {
        count: 1000,
        concurrency: 10,
        size: 10,
        delay: 5,
      },
      stats: _.cloneDeep(statsInitState),
    };
    this.handleParamChange = this.handleParamChange.bind(this);
    this.startTestRun = this.startTestRun.bind(this);
    this.runTestSet = this.runTestSet.bind(this);
  }

  resetResults() {
    this.setState(_.set(this.state, ['stats'], _.cloneDeep(statsInitState)));
  }

  handleParamChange(event) {
    this.setState(_.set(this.state, ['params', event.target.name], +event.target.value));
  }

  async runTestSet() {
    const concurrency = _.range(0, 110, 10);
    concurrency[0] = 1;
    const delay = _.range(0, 110, 10);
    for (let i1 = 0; i1 < concurrency.length; i1++) {
      for (let i2 = 0; i2 < delay.length; i2++) {
        await this.setState({ params: {
          count: concurrency[i1] * 100,
          concurrency: concurrency[i1],
          delay: delay[i2],
          size: 10,
        }});
        await this.startTestRun();
      }
    }
  }

  async startTestRun(event) {
    if (event) {
      event.preventDefault();
    }

    this.resetResults();
    await this.runTest(true);
    await this.runTest(false);
  }

  async runTest(useHttp1) {
    const version = useHttp1 ? 'http1': 'http2';
    const baseUrl = `https://localhost:${useHttp1 ? 8000 : 8001}`;

    this.setState(_.set(this.state, ['stats', version, 'running'], true));
    const { concurrency, size, delay, count } = this.state.params;

    const query = qs.stringify({ size, delay }, { addQueryPrefix: true });

    let completed = 0;
    const responses = []; // Responses from the server
    const durations = []; // Durations of the requests

    while (completed < count) {
      const batch = (count - completed >= concurrency) ? concurrency : count % concurrency;
      const requests = _.times(batch, () => fetch(
        `${baseUrl}/generate${query}`,
        { headers: { 'Content-Type': 'application/json' } },
      ));

      const start = Date.now();
      responses.push(await Promise.all(requests));
      durations.push(Date.now() - start);
      completed += batch;

      // Update progress to the state
      this.setState(_.set(this.state, ['stats', version, 'progress'], _.round((completed / count) * 100)))
    }

    // ### Post-process responses
    const bodys = await Promise.all(_.chain(responses)
      .flatten()
      .map(response => response.json())
      .value());

    // Calculate avegare duration which server took to process the requests
    const serverDelay = _.chain(bodys)
      .map((body) => body.end - body.start)
      .mean()
      .round()
      .value();

    // Subtract the avegare server duration from the request durations
    // to get how much time the requests used between the server and the client
    const stats = _.map(durations, time => time - serverDelay);

    const mean = _.round(math.mean(stats));
    const deviation = _.round(math.std(stats));
    const min = math.min(stats);
    const max = math.max(stats);

    this.setState(_.set(this.state, ['stats', version], {
      running: false,
      progress: 0,
      mean,
      deviation,
      min,
      max,
    }));

    await fetch(`${baseUrl}/save${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concurrency,
        version: useHttp1 ? 1 : 2,
        size,
        delay,
        durations: stats,
      })
    })
  }

  render() {
    const { params, stats } = this.state;
    return (
      <Layout>
        <div className="stats">
          <Stats stats={stats} />
        </div>
        <hr />
        <div className="controls pure-g">
          <div className="pure-u">
            <Controls
              runTestSet={this.runTestSet}
              onSubmit={this.startTestRun}
              onChange={this.handleParamChange}
              values={params}
              running={stats.http1.running || stats.http2.running}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default App