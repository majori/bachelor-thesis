import React from "react";
import styled from 'styled-components';

const Container = styled.div`

`;

export default () => {
  return (
    <Container>
      <form>
        <label>Connections<input type="number"></input></label>
        <label>Size<input type="number" /></label>
        <label>Delay<input type="number" /></label>
        <button type="submit">GO!</button>
      </form>
    </Container>
  );
};