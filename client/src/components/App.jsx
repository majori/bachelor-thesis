import _ from 'lodash';
import math from 'mathjs';
import qs from 'qs';
import React from 'react';
import styled from 'styled-components';
import Controls from './Controls';
import Stats from './Stats';


const Layout = styled.div`

`;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      params: {
        count: 100,
        concurrency: 1,
        size: 10,
        delay: 0,
      },
    };
    this.handleParamChange = this.handleParamChange.bind(this);
    this.startTestRun = this.startTestRun.bind(this);
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
    await this.runTest(true);
    await this.runTest(false);
  }

  async runTest(useHttp1) {
    const { concurrency, size, delay, count } = this.state.params;

    const query = qs.stringify({ size, delay }, { addQueryPrefix: true });
    const url = `https://localhost:${useHttp1 ? 8000 : 8001}/generate${query}`;

    let completed = 0;
    const responses = [];
    const durations = [];
    while (completed < count) {
      const batch = (count - completed >= concurrency) ? concurrency : count % concurrency;
      const requests = _.times(batch, () => fetch(url, { headers: { 'Content-Type': 'application/json' }}));

      const start = Date.now();
      responses.push(await Promise.all(requests));
      durations.push(Date.now() - start);
      completed += batch;
    }

    // Post-process responses
    const bodys = await Promise.all(_.chain(responses)
      .flatten()
      .map(response => response.json())
      .value());

    const serverDelay = _.chain(bodys)
      .map((body) => body.end - body.start)
      .mean()
      .value();

    const stats = _.map(durations, time => time - serverDelay);
    const mean = _.round(math.mean(stats));
    const variance = _.round(math.var(stats));

    console.log(`HTTP/${useHttp1 ? '1.1' : '2'}`, { mean, variance });
  }

  render() {
    return (
      <Layout>
        <div>
          <Stats target="1"/>
          <Stats target="2"/>
        </div>
        <Controls
          onSubmit={this.startTestRun}
          onChange={this.handleParamChange}
          values={this.state.params}
        />
      </Layout>
    );
  }
}

export default App