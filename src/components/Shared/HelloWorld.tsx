import React, { useState } from 'react';

interface HelloWorldProps {
  msg: string;
}

const HelloWorld: React.FC<HelloWorldProps> = ({ msg }) => {
  const [count, setCount] = useState<number>(0);

  return (
    <>
      <h1>{msg}</h1>

      <div className="card">
        <button type="button" onClick={() => setCount((prev) => prev + 1)}>
          count is {count}
        </button>
        <p>
          Edit
          <code>components/Shared/HelloWorld.tsx</code> to test HMR
        </p>
      </div>

      <p>
        Check out{' '}
        <a
          href="https://react.dev/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Documentation
        </a>
        , the official React learning resource
      </p>
      <p>
        Learn more about IDE Support for React in the{' '}
        <a
          href="https://react.dev/learn/editor-setup"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Docs Editor Setup Guide
        </a>
        .
      </p>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

      <style>{`
        .read-the-docs {
          color: #888;
        }
      `}</style>
    </>
  );
};

export default HelloWorld;