import React from 'react';
import './Node.css';

const Node = ({ node }) => {
    const getStatusText = (status) => {
        switch(status) {
            case 'idle': return 'IDLE';
            case 'processing': return 'PROCESSING';
            case 'success': return 'SUCCESS';
            case 'mismatched': return 'MISMATCHED';
            default: return status.toUpperCase();
        }
    };

    return (
        <div className={`node-container node-${node.status}`}>
            <div className="node-id">节点 #{node.id}</div>
            <div className="node-status">{getStatusText(node.status)}</div>
            {node.status === 'mismatched' && node.reason && (
                <div className="node-reason">{node.reason}</div>
            )}
        </div>
    );
};

export default Node; 