import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${value}%` }}
        >
          <div className="progress-glow"></div>
        </div>
        <div className="progress-text">{Math.round(value)}%</div>
      </div>
      <div className="progress-indicators">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`indicator ${value > i * 10 ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
