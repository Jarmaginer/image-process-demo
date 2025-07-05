export const processSteps = [
    {
        stage: "阶段一：任务初始化",
        process: "接收到图像处理任务，准备拆分。",
        action: "INIT_TASK",
    },
    {
        stage: "阶段二：节点筛选",
        process: "向所有可用节点广播任务需求。",
        action: "SHOW_ALL_NODES",
        nodes: [
            { id: 1, status: 'idle', reason: '' }, { id: 2, status: 'idle', reason: '' },
            { id: 3, status: 'idle', reason: '' }, { id: 4, status: 'idle', reason: '' },
            { id: 5, status: 'idle', reason: '' }, { id: 6, status: 'idle', reason: '' },
            { id: 7, status: 'idle', reason: '' }, { id: 8, status: 'idle', reason: '' },
            { id: 9, status: 'idle', reason: '' }, { id: 10, status: 'idle', reason: '' },
        ]
    },
    {
        stage: "阶段二：节点筛选",
        process: "进行第一轮筛选：硬件不匹配。",
        action: "FILTER_NODES",
        nodesToUpdate: [
            { id: 3, status: 'mismatched', reason: 'GPU型号过旧' },
            { id: 8, status: 'mismatched', reason: '内存不足' },
        ]
    },
    {
        stage: "阶段二：节点筛选",
        process: "进行第二轮筛选：当前负载过高。",
        action: "FILTER_NODES",
        nodesToUpdate: [
            { id: 5, status: 'mismatched', reason: 'CPU占用率 >95%' },
        ]
    },
    {
        stage: "阶段三：任务分配",
        process: "正在向匹配的节点分配数据块...",
        action: "ASSIGN_TASKS",
    },
    {
        stage: "阶段四：处理完成",
        process: "所有数据块处理完毕，结果已生成。",
        action: "FINALIZE",
    }
]; 