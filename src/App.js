import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
// import VehiclePanel from './components/VehiclePanel'; // No longer needed
import NodePanel from './components/NodePanel'; // Our new component
import ImagePanel from './components/ImagePanel'; // New image processing component
import ControlPanel from './components/ControlPanel';
import { processSteps } from './processSteps'; // Our new "script"
import gsap from 'gsap';

function App() {
  // New state management for the node processing flow
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nodes, setNodes] = useState([]);
  const [systemState, setSystemState] = useState('IDLE'); // Re-purposed systemState
  const [isTaskStarted, setIsTaskStarted] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBlocks, setImageBlocks] = useState([]);
  
  // Keep the original config state
  const [config, setConfig] = useState({
    migrationSpeed: 'NORMAL',
    compressionLevel: 'HIGH',
    encryptionEnabled: true,
    debugMode: false,
    autoRetry: true,
    stopOriginalAfterMigration: true
  });

  const nodeRefs = useRef([]);
  const animationTimelineRef = useRef(null);

  // Clear any existing animations
  const clearAnimations = () => {
    if (animationTimelineRef.current) {
      animationTimelineRef.current.kill();
    }
    gsap.set(".node-container", { clearProps: "all" });
  };

  const executeStep = useCallback((step, stepIndex) => {
    setSystemState('PROCESSING');
    clearAnimations();

    switch (step.action) {
      case 'INIT_TASK':
        setNodes([]);
        setTimeout(() => setSystemState('IDLE'), 500);
        break;

      case 'SHOW_ALL_NODES':
        setNodes(step.nodes);
        // Wait for DOM to update, then animate
        setTimeout(() => {
          const nodeElements = document.querySelectorAll('.node-container');
          if (nodeElements.length > 0) {
            // Create a timeline for smooth sequential animation
            const tl = gsap.timeline({
              onComplete: () => setSystemState('IDLE')
            });
            
            // Set initial state
            gsap.set(nodeElements, {
              opacity: 0,
              scale: 0.3,
              y: 60,
              rotation: -10
            });

            // Animate nodes appearing with stagger - fixed for smooth sequential animation
            tl.to(nodeElements, {
              opacity: 1,
              scale: 1,
              y: 0,
              rotation: 0,
              duration: 0.5,
              stagger: 0.08, // Simple stagger - each node starts 0.08s after the previous
              ease: "back.out(1.7)"
            });

            animationTimelineRef.current = tl;
      } else {
            setSystemState('IDLE');
      }
    }, 100);
        break;

      case 'FILTER_NODES':
        const nodesToUpdate = new Set(step.nodesToUpdate.map(u => u.id));
        
        // First, update the data to mark nodes as mismatched
        const updatedNodes = nodes.map(n =>
          nodesToUpdate.has(n.id) ? { 
            ...n, 
            status: 'mismatched', 
            reason: step.nodesToUpdate.find(u => u.id === n.id).reason 
          } : n
        );
        setNodes(updatedNodes);

        // Then animate the visual changes
        setTimeout(() => {
          const mismatchedElements = document.querySelectorAll('.node-mismatched');
          const matchedElements = document.querySelectorAll('.node-idle');
          
          const tl = gsap.timeline({
            onComplete: () => {
              // Remove mismatched nodes from state after animation
              setNodes(currentNodes => currentNodes.filter(n => n.status !== 'mismatched'));
              setTimeout(() => setSystemState('IDLE'), 300);
            }
          });

          // First, highlight the mismatched nodes with a warning effect
          tl.to(mismatchedElements, {
            scale: 1.1,
            borderColor: "#f85149",
            boxShadow: "0 0 20px rgba(248, 81, 73, 0.6)",
            duration: 0.4,
            ease: "power2.out"
          })
          // Then make them fade and shrink away
          .to(mismatchedElements, {
            opacity: 0,
            scale: 0.3,
            y: -30,
            rotation: 15,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.in"
          }, "+=0.5")
          // Meanwhile, make the remaining nodes glow slightly
          .to(matchedElements, {
            scale: 1.05,
            boxShadow: "0 0 15px rgba(56, 139, 253, 0.4)",
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
          }, "-=0.4");

          animationTimelineRef.current = tl;
        }, 200);
        break;

      case 'UPLOAD_IMAGE':
        // Wait for user to upload image
        setSystemState('WAITING_FOR_UPLOAD');
        break;

      case 'SPLIT_IMAGE':
        // Generate blocks based on available nodes count
        const availableNodes = nodes.filter(n => n.status === 'idle');
        const nodeCount = availableNodes.length;
        
        // Calculate grid dimensions that best fit the node count
        let cols = Math.ceil(Math.sqrt(nodeCount));
        let rows = Math.ceil(nodeCount / cols);
        
        const blocks = [];
        for (let i = 0; i < nodeCount; i++) {
          blocks.push({
            id: i + 1,
            row: Math.floor(i / cols),
            col: i % cols,
            status: 'splitting',
            nodeId: availableNodes[i].id
          });
        }
        
        setImageBlocks(blocks);
        
        // Animate the splitting process
        setTimeout(() => {
          // First phase: show splitting animation
          const canvas = document.querySelector('.image-canvas');
          if (canvas) {
            const tl = gsap.timeline({
              onComplete: () => {
                // Update blocks to completed state
                setImageBlocks(prev => prev.map(b => ({ ...b, status: 'ready' })));
                setSystemState('IDLE');
              }
            });
            
            // Flash effect to show splitting
            tl.to(canvas, {
              filter: 'brightness(1.5)',
              duration: 0.2,
              yoyo: true,
              repeat: 3
            });
          } else {
            setSystemState('IDLE');
          }
        }, 500);
        break;

      case 'ASSIGN_TASKS':
        // 两次动画：第一次全部变黄色，第二次依次变绿色
        const availableNodeIds = nodes.filter(n => n.status === 'idle').map(n => n.id);
        
        // 第一次动画：所有可用节点同时变成processing（黄色）
        setNodes(prevNodes => 
          prevNodes.map(n => 
            availableNodeIds.includes(n.id) ? { ...n, status: 'processing' } : n
          )
        );
        
        // 短暂延迟后，开始第二次动画：依次变成success状态
        setTimeout(() => {
          availableNodeIds.forEach((nodeId, index) => {
            setTimeout(() => {
              setNodes(prevNodes => 
                prevNodes.map(n => 
                  n.id === nodeId ? { ...n, status: 'success' } : n
                )
              );
              
              // 如果这是最后一个节点，完成步骤
              if (index === availableNodeIds.length - 1) {
                setTimeout(() => setSystemState('IDLE'), 200);
              }
            }, index * 20); // 20ms间隔 - 与原来的速度一致
          });
        }, 100); // 100ms延迟让第一次动画有时间显示
        break;

      case 'FINALIZE':
        const allElements = document.querySelectorAll('.node-container');
        const finalTl = gsap.timeline({
          onComplete: () => {
            setNodes([]);
            setSystemState('FINISHED');
          }
        });

        finalTl.to(allElements, {
          opacity: 0,
          scale: 0.5,
          y: 50,
          rotation: 10,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.in"
        });

        animationTimelineRef.current = finalTl;
        break;

      default:
        setSystemState('IDLE');
        break;
    }
  }, [nodes]);

  const startTask = useCallback(() => {
    setIsTaskStarted(true);
    setCurrentStepIndex(1); // Move to first actual step (SHOW_ALL_NODES)
    executeStep(processSteps[1], 1);
  }, [executeStep]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < processSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      executeStep(processSteps[nextIndex], nextIndex);
              } else {
      setSystemState('FINISHED');
    }
  }, [currentStepIndex, executeStep]);

  const handleImageUploaded = useCallback((imageData) => {
    setUploadedImage(imageData);
    setSystemState('IDLE');
  }, []);

  const resetSystem = () => {
    clearAnimations();
    setCurrentStepIndex(0);
    setNodes([]);
    setSystemState('IDLE');
    setIsTaskStarted(false);
  };
  
  // Don't auto-execute on mount, wait for user to click START TASK
  // useEffect removed

  // This part of the JSX is what we are replacing
  const renderTopPanel = () => {
    return <NodePanel nodes={nodes} />;
  }

  // 计算进度百分比 - 对齐到space-evenly分布的点
  const calculateProgress = () => {
    if (!isTaskStarted) return 0;
    if (systemState === 'FINISHED') return 100;
    
    // space-evenly会把7个点分布在8个等分区间中
    // 第1个点在1/8位置，第2个点在2/8位置，第3个点在3/8位置...
    // 所以当前点的位置 = currentStepIndex / 8 * 100
    
    const pointPosition = (currentStepIndex / 8) * 100;
    return pointPosition;
  };

  // 获取当前步骤描述
  const getCurrentStepDescription = () => {
    if (!isTaskStarted) return "等待任务启动...";
    if (systemState === 'FINISHED') return "所有任务已完成";
    return `步骤 ${currentStepIndex}/7: ${processSteps[currentStepIndex]?.process || "处理中..."}`;
  };

  return (
    <div className="App">
      <div className="app-header">
        <h1>$ ./image-process-demo --mode=cluster</h1>
        <div className="system-status">
          [STATUS] <span className={`status-${systemState.toLowerCase()}`}>{systemState}</span>
        </div>
      </div>

      {/* 顶部进度条区域 */}
      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-label">DTA 分布式任务分配进度</span>
          <span className="progress-percentage">{calculateProgress()}%</span>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <div className="progress-steps">
            {processSteps.slice(1).map((step, index) => {
              const stepNumber = index + 1; // 步骤编号，从1开始
              const isCompleted = stepNumber < currentStepIndex;
              const isActive = stepNumber === currentStepIndex;
              
              return (
                <div 
                  key={index}
                  className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                />
              );
            })}
          </div>
        </div>
        <div className="progress-description">
          {getCurrentStepDescription()}
        </div>
      </div>

      <div className="main-content">
        <div className="top-section">
          <div className="vehicles-container">
            {/* The user's red-boxed area is replaced by this single line */}
            {renderTopPanel()}
              </div>
          <div className="image-container">
            <ImagePanel 
              currentStep={processSteps[currentStepIndex]}
              onImageUploaded={handleImageUploaded}
              uploadedImage={uploadedImage}
              imageBlocks={imageBlocks}
            />
          </div>
        </div>

        <div className="bottom-section">
          <div className="left-panel">
            <ControlPanel
              onStartTask={startTask}
              onNextStep={goToNextStep}
              onReset={resetSystem}
              systemState={systemState}
              currentStepIndex={currentStepIndex}
              totalSteps={processSteps.length}
              config={config}
              setConfig={setConfig}
            />
          </div>

          <div className="right-panel">
            {/* The original system monitor and logs are kept for visual consistency */}
            <div className="system-monitor">
              <h3>SYSTEM_MONITOR</h3>
              <div className="monitor-content">
                <div className="monitor-item">
                  <span className="monitor-label">NETWORK_TOPOLOGY:</span>
                  <span className="monitor-value">MESH_ACTIVE</span>
                </div>
                <div className="monitor-item">
                  <span className="monitor-label">TOTAL_VEHICLES:</span>
                  <span className="monitor-value">2/8</span>
                </div>
                <div className="monitor-item">
                  <span className="monitor-label">UPTIME:</span>
                  <span className="monitor-value">02:34:12</span>
                </div>
                <div className="monitor-item">
                  <span className="monitor-label">BANDWIDTH_USAGE:</span>
                  <span className="monitor-value">1.3/10.0 Gbps</span>
                </div>
                <div className="monitor-item">
                  <span className="monitor-label">LAST_MIGRATION:</span>
                  <span className="monitor-value">--:--:--</span>
                </div>
              </div>
            </div>

            <div className="system-logs">
              <h3>SYSTEM_LOGS</h3>
              <div className="logs-content">
                <div className="log-entry">
                  <span className="log-time">[INFO]</span>
                  <span className="log-message">System initialized</span>
                </div>
                <div className="log-entry">
                  <span className="log-time">[INFO]</span>
                  <span className="log-message">Vehicle A connected</span>
                </div>
                <div className="log-entry">
                  <span className="log-time">[INFO]</span>
                  <span className="log-message">Vehicle B connected</span>
                </div>
                <div className="log-entry">
                  <span className="log-time">[DEBUG]</span>
                  <span className="log-message">Network mesh established</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
