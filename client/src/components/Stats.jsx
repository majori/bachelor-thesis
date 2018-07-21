import React from "react";
import styled from 'styled-components';

const Container = styled.div`

`;

export default ({ stats }) => {
  const Results = (
    <div>
      {
        !stats.mean && !stats.variance ?
          <span>Ready for test run..</span> :
          <div>
            <span>Mean: {stats.mean} ms</span>  
            <span>Variance: {stats.variance} ms</span>  
          </div>
      }
    </div>
  );
  return (
    <Container>
      { stats.loading ?
        <span>Running... {stats.progress}%</span> :
        Results
      }
    </Container>
  );
};