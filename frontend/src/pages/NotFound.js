import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 text-center">
            <div className="not-found-content">
              <div className="error-code mb-4">
                <span className="display-1 fw-bold text-primary">404</span>
              </div>
              
              <div className="error-icon mb-4">
                <i className="bi bi-compass display-1 text-muted"></i>
              </div>
              
              <h2 className="mb-3">Page Not Found</h2>
              <p className="lead text-muted mb-4">
                Oops! The page you're looking for doesn't exist. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>
              
              <div className="error-actions">
                <Link to="/" className="btn btn-primary btn-lg me-3">
                  <i className="bi bi-house me-2"></i>
                  Go Home
                </Link>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }

        .not-found-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
        }

        .error-code {
          position: relative;
        }

        .error-code::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, transparent, white, transparent);
          border-radius: 2px;
        }

        .error-icon {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .btn {
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .not-found-content {
            padding: 2rem;
            margin: 1rem;
          }
          
          .error-actions .btn {
            width: 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
