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
            { id: 9, status: 'idle', reason: '' }, { id: 10, status: 'idle', reason: '' },{ id: 11, status: 'idle', reason: '' }, { id: 12, status: 'idle', reason: '' },{ id: 13, status: 'idle', reason: '' }, { id: 14, status: 'idle', reason: '' }
        ]
    },
    {
        stage: "阶段二：节点筛选",
        process: "进行第一轮筛选：硬件不匹配。",
        action: "FILTER_NODES",
        nodesToUpdate: [
            { id: 8, status: 'mismatched', reason: '内存不足\nCPU占用率 >95%' },
        ]
    },
    {
        stage: "阶段二：节点筛选",
        process: "进行第二轮筛选：当前负载过高。",
        action: "FILTER_NODES",
        nodesToUpdate: [
            { id: 5, status: 'mismatched', reason: 'CUDA版本过低' },
        ]
    },
    {
        stage: "阶段三：图像上传",
        process: "请上传需要处理的8K分辨率图像。",
        action: "UPLOAD_IMAGE",
    },
    {
        stage: "阶段四：图像分割",
        process: "正在将图像切分为子任务，分配给可用节点...",
        action: "SPLIT_IMAGE",
    },
    {
        stage: "阶段五：任务分配",
        process: "正在将图像块分配给可用节点...",
        action: "ASSIGN_TASKS",
    },
    {
        stage: "阶段六：DAG构建",
        process: "构建任务依赖图，优化执行顺序。",
        action: "BUILD_DAG",
    },
    {
        stage: "阶段七：处理完成",
        process: "所有图像块处理完毕，正在合并结果。",
        action: "FINALIZE",
    }
]; 