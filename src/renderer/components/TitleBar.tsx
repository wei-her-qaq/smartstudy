import React from 'react';
import { MinusIcon, SquareIcon, XIcon, LogoIcon } from './Icons';

const TitleBar: React.FC = () => {
  return (
    <div className="titlebar">
      <div className="titlebar-logo">
        <LogoIcon size={18} />
        <span className="titlebar-title">智学助手</span>
      </div>
      <div className="titlebar-actions">
        <button className="titlebar-btn" onClick={() => window.api.window.minimize()} title="最小化">
          <MinusIcon size={12} />
        </button>
        <button className="titlebar-btn" onClick={() => window.api.window.maximize()} title="最大化">
          <SquareIcon size={12} />
        </button>
        <button className="titlebar-btn close" onClick={() => window.api.window.close()} title="关闭">
          <XIcon size={12} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;