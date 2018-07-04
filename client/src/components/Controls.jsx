import React from "react";
import styled from 'styled-components';

const Container = styled.div`

`;

export default ({ onSubmit, onChange, values }) => {
  console.log(values);
  return (
    <Container>
      <form onSubmit={onSubmit}>
        <label>
          Connections
          <input
            name="connections"
            type="number"
            onChange={onChange}
            value={values.connections.toString()}
          />
        </label>
        <label>
          Size
          <input
            name="size"
            type="number"
            onChange={onChange}
            value={values.size.toString()}
          />
        </label>
        <label>
          Delay
          <input
            name="delay"
            type="number"
            onChange={onChange}
            value={values.delay.toString()}
          />
        </label>
        <button type="submit">GO!</button>
      </form>
    </Container>
  );
};