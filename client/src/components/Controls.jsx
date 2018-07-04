import React from "react";
import styled from 'styled-components';

const Container = styled.div`

`;

export default ({ onSubmit, onChange, values }) => {
  return (
    <Container>
      <form onSubmit={onSubmit}>
        <label>
          Request count
          <input
            name="count"
            type="number"
            onChange={onChange}
            value={values.count.toString()}
          />
        </label>
        <label>
          Concurrency
          <input
            name="concurrency"
            type="number"
            onChange={onChange}
            value={values.concurrency.toString()}
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