import React from 'react';
import _ from 'lodash';
import qs from 'qs';
import styled from 'styled-components';

import Stats from './Stats';
import Controls from './Controls';

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
    const { concurrency, size, delay, count } = this.state.params;

    const query = qs.stringify({ size, delay }, { addQueryPrefix: true });
    const url = `https://localhost:8000/generate${query}`;

    let completed = 0;
    while (completed <= count) {
      const batch = (count - completed >= concurrency) ? concurrency : count % concurrency;
      const requests = _.times(batch, () => fetch(url),);

      const start = Date.now();
      const responses = await Promise.all(requests);
      console.log(Date.now() - start);
      completed += batch;
    }
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