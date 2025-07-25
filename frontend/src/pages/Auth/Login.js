import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useNotification } from '../../hooks/useNotification';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { isOnline } = useNetwork();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      const errorMsg = 'Login requires an internet connection. Please check your network and try again.';
      setError(errorMsg);
      showError(errorMsg, 'Connection Required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess(`Welcome back! You have successfully logged in.`, 'Login Successful');
        // Redirect to intended page or dashboard
        navigate(from, { replace: true });
      } else {
        const errorMsg = result.message || 'Login failed. Please try again.';
        setError(errorMsg);
        showError(errorMsg, 'Login Failed');
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      showError(errorMsg, 'Unexpected Error');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="login-card">
              <div className="login-header text-center mb-4">
                <div className="login-icon mb-3">
                  <i className="bi bi-mortarboard-fill"></i>
                </div>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Sign in to continue your learning journey</p>
              </div>

              {/* Network Status Warning */}
              {!isOnline && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <i className="bi bi-wifi-off me-2"></i>
                  <span>You're offline. Login requires an internet connection.</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    disabled={loading || !isOnline}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading || !isOnline}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={togglePasswordVisibility}
                      disabled={loading || !isOnline}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading || !isOnline}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ms-2">Signing In...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary fw-semibold">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="demo-credentials mt-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-info-circle me-2"></i>
                      Demo Credentials
                    </h6>
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Student:</small>
                        <small className="fw-semibold">student1 / password123</small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Teacher:</small>
                        <small className="fw-semibold">teacher1 / password123</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .login-card {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 2rem;
        }

        .form-control {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .form-label {
          font-weight: 600;
          color: var(--dark-color);
          margin-bottom: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          transform: none;
          box-shadow: none;
          opacity: 0.6;
        }

        .input-group .btn {
          border: 2px solid #e9ecef;
          border-left: none;
          border-radius: 0 10px 10px 0;
        }

        .demo-credentials .card {
          border: none;
          border-radius: 10px;
        }

        .demo-credentials .card-body {
          padding: 1rem;
        }

        .alert {
          border: none;
          border-radius: 10px;
          border-left: 4px solid;
        }

        .alert-warning {
          border-left-color: var(--warning-color);
          background-color: rgba(255, 193, 7, 0.1);
        }

        .alert-danger {
          border-left-color: var(--danger-color);
          background-color: rgba(220, 53, 69, 0.1);
        }

        @media (max-width: 768px) {
          .login-card {
            padding: 2rem;
            margin: 1rem;
          }
          
          .login-icon {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
