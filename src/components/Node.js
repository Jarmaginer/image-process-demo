import React from 'react';
import './Node.css';

const Node = ({ node }) => {
    return (
        <div className={`node-container node-${node.status}`}>
            <div className="node-id">节点 #{node.id}</div>
            <div className="node-status">{node.status}</div>
            {node.status === 'mismatched' && node.reason && (
                <div className="node-reason">{node.reason}</div>
            )}
        </div>
    );
};

export default Node; 