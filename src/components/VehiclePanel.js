import React from 'react';
import ProgressBar from './ProgressBar';
import './VehiclePanel.css';

const VehiclePanel = ({ title, vehicleId, state, isActive }) => {
  const { status, llmOutput, cpuUsage, memoryUsage, networkLatency, progress, temperature, powerLevel } = state;

  return (
    <div className={`vehicle-panel ${isActive ? 'active' : ''}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        <div className={`status-indicator ${status.replace(/\s+/g, '-').toLowerCase()}`}>
          {status}
        </div>
      </div>

      <div className="panel-content">
        <div className="llm-output-section">
          <h3>LLM 推理输出</h3>
          <div className="llm-output">
            <div className="output-text">
              {llmOutput}
              {isActive && llmOutput && <span className="cursor">|</span>}
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">CPU:</span>
              <span className="metric-value">{Math.round(cpuUsage)}%</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${cpuUsage}%` }}></div>
              </div>
            </div>

            <div className="metric-item">
              <span className="metric-label">MEM:</span>
              <span className="metric-value">{Math.round(memoryUsage)}%</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${memoryUsage}%` }}></div>
              </div>
            </div>

            <div className="metric-item">
              <span className="metric-label">TEMP:</span>
              <span className="metric-value">{Math.round(temperature)}°C</span>
            </div>

            <div className="metric-item">
              <span className="metric-label">PWR:</span>
              <span className="metric-value">{powerLevel}%</span>
            </div>

            <div className="metric-item">
              <span className="metric-label">LAT:</span>
              <span className="metric-value">{Math.round(networkLatency)}ms</span>
            </div>
          </div>

          {(status === '打包中' || status === '接收中') && (
            <div className="progress-section">
              <h4>{status === '打包中' ? 'PACKAGING' : 'RECEIVING'}</h4>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>
      </div>

      <div className="panel-footer">
        <div className="vehicle-id">Vehicle {vehicleId}</div>
        <div className="connection-status">
          <span className={`connection-dot ${isActive ? 'connected' : 'standby'}`}></span>
          {isActive ? '连接中' : '待机'}
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;
