import React from 'react';
import Node from './Node'; // We will create this component next
import './NodePanel.css'; // We will create this file next

const NodePanel = ({ nodes }) => {
  return (
    <div className="node-panel-container">
      <div className="node-grid">
        {nodes.map(node => (
          <Node key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default NodePanel; 