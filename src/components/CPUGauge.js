import React from 'react';

const CPUGauge = ({ value }) => {
  // 简单的文本显示，开发者风格
  const getColor = () => {
    if (value < 30) return '#4ec9b0';
    if (value < 60) return '#dcdcaa';
    return '#f44747';
  };

  const getBar = () => {
    const filled = Math.round(value / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  return (
    <div className="cpu-gauge" style={{
      fontFamily: 'Consolas, monospace',
      fontSize: '12px',
      textAlign: 'center',
      color: getColor()
    }}>
      <div style={{ marginBottom: '5px' }}>
        CPU: {Math.round(value)}%
      </div>
      <div style={{ letterSpacing: '1px' }}>
        {getBar()}
      </div>
    </div>
  );
};

export default CPUGauge;
