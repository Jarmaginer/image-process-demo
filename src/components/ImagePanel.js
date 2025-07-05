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
                <p>✅ 图像上传成功！</p>
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
      case 'ASSIGN_TASKS':
      case 'BUILD_DAG':
        return (
          <div className="image-display">
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info">
                <p>✅ 已生成 {imageBlocks.length} 个图像块</p>
                <p>🔄 正在分配到 {imageBlocks.length} 个节点</p>
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