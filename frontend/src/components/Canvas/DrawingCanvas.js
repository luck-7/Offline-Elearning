import React, { useEffect, useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';

const DrawingCanvas = ({ 
  width = 800, 
  height = 600, 
  onSave = null, 
  initialImage = null,
  className = '' 
}) => {
  const {
    canvasRef,
    isDrawing,
    tool,
    setTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    redo,
    canUndo,
    canRedo,
    getCanvasImage,
    loadImage
  } = useCanvas(width, height);

  // Load initial image if provided
  useEffect(() => {
    if (initialImage) {
      loadImage(initialImage);
    }
  }, [initialImage, loadImage]);

  // Handle save
  const handleSave = () => {
    if (onSave) {
      const imageData = getCanvasImage();
      onSave(imageData);
    }
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  return (
    <div className={`drawing-canvas-container ${className}`}>
      {/* Canvas Tools */}
      <div className="canvas-tools mb-3">
        <div className="row g-2">
          <div className="col-auto">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-outline-primary ${tool === 'pen' ? 'active' : ''}`}
                onClick={() => setTool('pen')}
                title="Pen"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${tool === 'eraser' ? 'active' : ''}`}
                onClick={() => setTool('eraser')}
                title="Eraser"
              >
                <i className="bi bi-eraser"></i>
              </button>
            </div>
          </div>

          <div className="col-auto">
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Choose color"
              style={{ width: '40px', height: '38px' }}
            />
          </div>

          <div className="col-auto">
            <input
              type="range"
              className="form-range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              title="Brush size"
              style={{ width: '100px' }}
            />
            <small className="text-muted">{lineWidth}px</small>
          </div>

          <div className="col-auto">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>

          <div className="col-auto">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={clearCanvas}
              title="Clear canvas"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>

          {onSave && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSave}
                title="Save drawing"
              >
                <i className="bi bi-save me-1"></i>
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="canvas-container border rounded"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'grab' : 'default',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Canvas Info */}
      <div className="canvas-info mt-2">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          {isDrawing ? 'Drawing...' : 'Click and drag to draw'}
          {tool === 'eraser' && ' | Eraser mode active'}
        </small>
      </div>

      <style jsx>{`
        .canvas-container {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .canvas-tools {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .btn-group .btn {
          border-radius: 6px !important;
        }

        .btn-group .btn:not(:last-child) {
          margin-right: 2px;
        }

        .form-range {
          margin-top: 8px;
        }

        .canvas-wrapper {
          display: flex;
          justify-content: center;
          overflow: auto;
          max-width: 100%;
        }

        @media (max-width: 768px) {
          .canvas-tools .row {
            justify-content: center;
          }
          
          .canvas-tools .col-auto {
            margin-bottom: 0.5rem;
          }
          
          .canvas-container {
            max-width: 100%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DrawingCanvas;
