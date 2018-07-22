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
    variance: null,
    min: null,
    max: null,
  },
  http2: {
    running: false,
    progress: 0,
    mean: null,
    variance: null,
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
  }

  async resetResults() {
    return this.setState(_.set(this.state, ['stats'], _.cloneDeep(statsInitState)));
  }

  handleParamChange(event) {
    this.setState({
      params: {
        ...this.state.params,
        [event.target.name]: +event.target.value,
      },
    });
  }

  async startTestRun(event) {
    event.preventDefault();
    await this.resetResults();
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
    const responses = [];
    const durations = [];
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
      this.setState(_.set(this.state, ['stats', version, 'progress'], _.round((completed / count) * 100)))
    }

    // ### Post-process responses
    const bodys = await Promise.all(_.chain(responses)
      .flatten()
      .map(response => response.json())
      .value());

    const serverDelay = _.chain(bodys)
      .map((body) => body.end - body.start)
      .mean()
      .round()
      .value();

    const stats = _.map(durations, time => time - serverDelay);

    const mean = _.round(math.mean(stats));
    const variance = _.round(math.var(stats));
    const min = math.min(stats);
    const max = math.max(stats);

    this.setState(_.set(this.state, ['stats', version], {
      running: false,
      progress: 0,
      mean,
      variance,
      min,
      max,
    }));

    await fetch(`${baseUrl}/save${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concurrency,
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