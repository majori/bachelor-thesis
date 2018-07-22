import React from "react";
import styled from 'styled-components';

const Form = styled.form``;

export default ({ onSubmit, onChange, runTestSet, values, running }) => {
  return (
    <Form className="pure-form pure-form-aligned" onSubmit={onSubmit}>
      <fieldset>
        <div className="pure-control-group">
          <label>Request count</label>
          <input
            name="count"
            type="number"
            onChange={onChange}
            value={values.count.toString()}
            disabled={running}
          />
        </div>
      
        <div className="pure-control-group">
          <label>Concurrency</label>
          <input
            name="concurrency"
            type="number"
            onChange={onChange}
            value={values.concurrency.toString()}
            disabled={running}
          />
        </div>

        <div className="pure-control-group">
          <label>Payload size</label>
          <input
            name="size"
            type="number"
            onChange={onChange}
            value={values.size.toString()}
            disabled={running}
          />
          <span className="pure-form-message-inline">kB</span>
        </div>

        <div className="pure-control-group">
          <label>Delay</label>
          <input
            name="delay"
            type="number"
            onChange={onChange}
            value={values.delay.toString()}
            disabled={running}
          />
          <span className="pure-form-message-inline">ms</span>
        </div>

        <div className="pure-controls">
          <button
            className={`
            pure-button
            pure-button-primary
            ${running ? 'pure-button-disabled' : ''}`}
            type="submit"
          >
            Run a single test
          </button>
        </div>
        <div className="pure-controls">
          <button
            className={`
              pure-button
              ${running ? 'pure-button-disabled' : ''}`}
            type="button"
            onClick={runTestSet}
          >
            Start automated test set
          </button>
        </div>
      </fieldset>
    </Form>
  );
};