import React from "react";
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;

  .results .result {
    text-align: left;
  }

  .results .label {
    text-align: right;
  }

  .results .label span {
    margin-right: 7px;
  }
`;

const Stats = ({ stats, waiting }) => {
  const Results = (
    <div>
      {
        !stats.mean && !stats.variance ?
          <span>
            {
              !waiting ?
                'Ready for test run..' :
                'Waiting..'
            }
          </span> :
          <div className="results pure-g">
            <div className="pure-u-1-2 label">
              <span>Mean:</span>
            </div>
            <div className="pure-u-1-2 result">
              <span><b>{stats.mean} ms</b></span>  
            </div>
            <div className="pure-u-1-2 label">
              <span>Variance:</span>
            </div>
            <div className="pure-u-1-2 result">
              <span><b>{stats.variance} ms</b></span>  
            </div>
            <div className="pure-u-1-2 label">
              <span>Min:</span>
            </div>
            <div className="pure-u-1-2 result">
              <span><b>{stats.min} ms</b></span>  
            </div>
            <div className="pure-u-1-2 label">
              <span>Max:</span>
            </div>
            <div className="pure-u-1-2 result">
              <span><b>{stats.max} ms</b></span>  
            </div>
          </div>
      }
    </div>
  );
  return stats.running ?
    <span>Running... {stats.progress}%</span> :
    Results;
};

export default ({ stats }) => {
  return (
    <Container className="pure-g">
      <div className="pure-u-1-2">
        <h2>HTTP/1.1</h2>
        <Stats stats={stats.http1} />
      </div>
      <div className="pure-u-1-2">
        <h2>HTTP/2</h2>
        <Stats stats={stats.http2} waiting={stats.http1.running} />
      </div>
    </Container>
  );
}
