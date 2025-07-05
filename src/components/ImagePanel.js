import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ImagePanel.css';

const ImagePanel = ({ currentStep, onImageUploaded, uploadedImage, imageBlocks }) => {
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUploaded(e.target.result);
        setImageLoaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Draw image on canvas when uploaded
  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas to larger size
        canvas.width = 600;
        canvas.height = 450;
        
        // Clear and draw image to fit canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw grid lines based on image blocks if in split phase
        if (currentStep?.action === 'SPLIT_IMAGE' && imageBlocks.length > 0) {
          animateImageSplit(ctx, canvas.width, canvas.height, imageBlocks);
        }
        
        // Draw static grid with blocks for assign/build/finalize phases
        if (['ASSIGN_TASKS', 'BUILD_DAG', 'FINALIZE'].includes(currentStep?.action) && imageBlocks.length > 0) {
          drawStaticGrid(ctx, canvas.width, canvas.height, imageBlocks);
        }
        
        // Animate blocks turning green for assign tasks phase
        if (currentStep?.action === 'ASSIGN_TASKS' && imageBlocks.length > 0) {
          setTimeout(() => {
            animateBlocksProcessing(ctx, canvas.width, canvas.height, imageBlocks);
          }, 500);
        }
      };
      
      img.src = uploadedImage;
    }
  }, [uploadedImage, currentStep, imageBlocks]);

  const animateImageSplit = (ctx, width, height, blocks) => {
    if (!blocks || blocks.length === 0) return;
    
    // Calculate grid dimensions from blocks
    const maxCol = Math.max(...blocks.map(b => b.col)) + 1;
    const maxRow = Math.max(...blocks.map(b => b.row)) + 1;
    
    const blockWidth = width / maxCol;
    const blockHeight = height / maxRow;
    
    // Create timeline for split animation
    const tl = gsap.timeline();
    
    // First, draw all grid lines with animation
    tl.add(() => {
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.globalAlpha = 0;
    });
    
    // Animate grid lines appearing
    tl.to({}, {
      duration: 1,
      ease: "power2.out",
      onUpdate: function() {
        ctx.globalAlpha = this.progress();
        ctx.clearRect(0, 0, width, height);
        
        // Redraw image
        const img = new Image();
        img.onload = () => {
          ctx.globalAlpha = 1;
          ctx.drawImage(img, 0, 0, width, height);
          ctx.globalAlpha = this.progress();
          
          // Draw grid
          ctx.strokeStyle = '#58a6ff';
          ctx.lineWidth = 3;
          
          // Vertical lines
          for (let i = 1; i < maxCol; i++) {
            const x = blockWidth * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          
          // Horizontal lines
          for (let i = 1; i < maxRow; i++) {
            const y = blockHeight * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        };
        img.src = uploadedImage;
      }
    });
    
    // Then animate block labels appearing one by one
    blocks.forEach((block, index) => {
      tl.to({}, {
        duration: 0.3,
        delay: index * 0.1,
        ease: "back.out(1.7)",
        onComplete: () => {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#58a6ff';
          ctx.font = 'bold 16px Consolas';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const x = blockWidth * block.col + blockWidth / 2;
          const y = blockHeight * block.row + blockHeight / 2;
          
          // Draw block background
          ctx.fillStyle = 'rgba(88, 166, 255, 0.15)';
          ctx.fillRect(
            blockWidth * block.col + 5,
            blockHeight * block.row + 5,
            blockWidth - 10,
            blockHeight - 10
          );
          
          // Draw block text
          ctx.fillStyle = '#58a6ff';
          ctx.fillText(`块${block.id}`, x, y - 10);
          ctx.font = 'bold 14px Consolas';
          ctx.fillText(`→节点${block.nodeId}`, x, y + 10);
        }
      });
    });
  };

  const drawStaticGrid = (ctx, width, height, blocks) => {
    if (!blocks || blocks.length === 0) return;
    
    // Calculate grid dimensions from blocks
    const maxCol = Math.max(...blocks.map(b => b.col)) + 1;
    const maxRow = Math.max(...blocks.map(b => b.row)) + 1;
    
    const blockWidth = width / maxCol;
    const blockHeight = height / maxRow;
    
    // Draw grid lines
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
    // Vertical lines
    for (let i = 1; i < maxCol; i++) {
      const x = blockWidth * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < maxRow; i++) {
      const y = blockHeight * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw block labels and backgrounds
    blocks.forEach((block) => {
      const x = blockWidth * block.col + blockWidth / 2;
      const y = blockHeight * block.row + blockHeight / 2;
      
      // Draw block background
      ctx.fillStyle = 'rgba(88, 166, 255, 0.15)';
      ctx.fillRect(
        blockWidth * block.col + 5,
        blockHeight * block.row + 5,
        blockWidth - 10,
        blockHeight - 10
      );
      
      // Draw block text
      ctx.fillStyle = '#58a6ff';
      ctx.font = 'bold 16px Consolas';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`块${block.id}`, x, y - 10);
      ctx.font = 'bold 14px Consolas';
      ctx.fillText(`→节点${block.nodeId}`, x, y + 10);
    });
  };

  const animateBlocksProcessing = (ctx, width, height, blocks) => {
    if (!blocks || blocks.length === 0) return;
    
    // Calculate grid dimensions from blocks
    const maxCol = Math.max(...blocks.map(b => b.col)) + 1;
    const maxRow = Math.max(...blocks.map(b => b.row)) + 1;
    
    const blockWidth = width / maxCol;
    const blockHeight = height / maxRow;
    
    // Create timeline for blocks turning green
    const tl = gsap.timeline();
    
    // Animate each block turning green in sequence
          blocks.forEach((block, index) => {
        tl.to({}, {
          duration: 0.02,
          delay: index * 0.002, // 与左侧节点20ms间隔匹配
          ease: "power2.out",
        onStart: () => {
          // Redraw the image and grid
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Redraw grid lines
            ctx.strokeStyle = '#58a6ff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1;
            
            // Vertical lines
            for (let i = 1; i < maxCol; i++) {
              const x = blockWidth * i;
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, height);
              ctx.stroke();
            }
            
            // Horizontal lines
            for (let i = 1; i < maxRow; i++) {
              const y = blockHeight * i;
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(width, y);
              ctx.stroke();
            }
            
            // Draw all blocks
            blocks.forEach((b, i) => {
              const bx = blockWidth * b.col + blockWidth / 2;
              const by = blockHeight * b.row + blockHeight / 2;
              
              // Determine if this block should be green (processed)
              const isProcessed = i <= index;
              
              // Draw block background
              ctx.fillStyle = isProcessed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(88, 166, 255, 0.15)';
              ctx.fillRect(
                blockWidth * b.col + 5,
                blockHeight * b.row + 5,
                blockWidth - 10,
                blockHeight - 10
              );
              
              // Draw block border for processed blocks
              if (isProcessed) {
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  blockWidth * b.col + 5,
                  blockHeight * b.row + 5,
                  blockWidth - 10,
                  blockHeight - 10
                );
              }
              
              // Draw block text
              ctx.fillStyle = isProcessed ? '#22c55e' : '#58a6ff';
              ctx.font = 'bold 16px Consolas';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`块${b.id}`, bx, by - 10);
              ctx.font = 'bold 14px Consolas';
              ctx.fillText(`→节点${b.nodeId}`, bx, by + 10);
              
              // Add checkmark for processed blocks
              if (isProcessed) {
                ctx.font = 'bold 20px Consolas';
                ctx.fillStyle = '#22c55e';
                ctx.fillText('✓', bx + blockWidth/3, by - blockHeight/3);
              }
            });
          };
          img.src = uploadedImage;
        }
      });
    });
  };

  const renderContent = () => {
    const action = currentStep?.action;

    switch (action) {
      case 'UPLOAD_IMAGE':
        // If image is already uploaded, show it instead of upload area
        if (uploadedImage && imageLoaded) {
          return (
            <div className="image-display">
              <canvas ref={canvasRef} className="image-canvas" />
              <div className="upload-success">
                <button 
                  className="upload-new-btn"
                  onClick={handleUploadClick}
                >
                  重新上传
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          );
        }
        return (
          <div className="upload-area">
            <div 
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleUploadClick}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <p>拖拽图片到此处或点击上传</p>
                <p className="upload-hint">支持 JPG, PNG 格式</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        );

      case 'SPLIT_IMAGE':
        return (
          <div className="image-display">
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info">
              </div>
            )}
          </div>
        );

      case 'ASSIGN_TASKS':
        return (
          <div className="image-display">
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info processing">
              </div>
            )}
          </div>
        );

      case 'BUILD_DAG':
        return (
          <div className="image-display">
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info">
              </div>
            )}
          </div>
        );

      case 'FINALIZE':
        return (
          <div className="image-display">
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info">
              </div>
            )}
          </div>
        );

      default:
        if (uploadedImage && imageLoaded) {
          return (
            <div className="image-display">
              <canvas ref={canvasRef} className="image-canvas" />
            </div>
          );
        }
        return (
          <div className="placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🖼️</div>
              <p>图像处理区域</p>
              <p className="placeholder-hint">等待图像上传阶段</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="image-panel-container">
      {renderContent()}
    </div>
  );
};

export default ImagePanel; 