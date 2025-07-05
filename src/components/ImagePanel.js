import React, { useState, useRef, useEffect } from 'react';
import './ImagePanel.css';

const ImagePanel = ({ currentStep, onImageUploaded, uploadedImage, imageBlocks }) => {
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
        // Set canvas size
        canvas.width = 400;
        canvas.height = 300;
        
        // Draw image to fit canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw grid lines for 4x4 split if in split phase
        if (currentStep?.action === 'SPLIT_IMAGE') {
          drawGrid(ctx, canvas.width, canvas.height);
        }
      };
      
      img.src = uploadedImage;
    }
  }, [uploadedImage, currentStep]);

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Draw vertical lines
    for (let i = 1; i < 4; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const renderContent = () => {
    const action = currentStep?.action;

    switch (action) {
      case 'UPLOAD_IMAGE':
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
            <div className="image-title">图像分割预览</div>
            <canvas ref={canvasRef} className="image-canvas" />
            {imageBlocks && imageBlocks.length > 0 && (
              <div className="blocks-info">
                <p>已生成 {imageBlocks.length} 个图像块</p>
              </div>
            )}
          </div>
        );

      default:
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
      <div className="image-panel-header">
        <h3>图像处理面板</h3>
        <div className="image-status">
          {uploadedImage ? '✅ 图像已加载' : '⏳ 等待上传'}
        </div>
      </div>
      <div className="image-panel-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ImagePanel; 