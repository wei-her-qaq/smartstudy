import React from 'react';

const TitleBar: React.FC = () => {
  return (
    <div className="titlebar">
      <span className="titlebar-title">智学助手</span>
      <div className="titlebar-actions">
        <button className="titlebar-btn" onClick={() => window.api.window.minimize()}>─</button>
        <button className="titlebar-btn" onClick={() => window.api.window.maximize()}>□</button>
        <button className="titlebar-btn close" onClick={() => window.api.window.close()}>✕</button>
      </div>
    </div>
  );
};

export default TitleBar;