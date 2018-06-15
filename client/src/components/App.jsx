import React from "react";
import styled from 'styled-components';

import Stats from './Stats';
import Controls from './Controls';

const Layout = styled.div`

`;

class App extends React.Component {
  render() {
    return (
      <Layout>
        <div>
          <Stats target="1"/>
          <Stats target="2"/>
        </div>
        <Controls />
      </Layout>
    );
  }
}

export default App