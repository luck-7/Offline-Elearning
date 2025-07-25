import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { progressAPI, coursesAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageCompletion: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [progress, setProgress] = useState([]);

  const { user } = useAuth();
  const { isOnline, getConnectionQuality } = useNetwork();
  const { getCachedData, cacheData } = useOffline();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user stats
      if (isOnline) {
        try {
          const statsResponse = await progressAPI.getMyStats();
          setStats(statsResponse.data.data);
          await cacheData('userStats', statsResponse.data.data);
        } catch (error) {
          console.error('Failed to load stats:', error);
          // Try to load from cache
          const cachedStats = await getCachedData('userStats');
          if (cachedStats) {
            setStats(cachedStats);
          }
        }

        // Load progress
        try {
          const progressResponse = await progressAPI.getMyProgress();
          setProgress(progressResponse.data);
          await cacheData('userProgress', progressResponse.data);
          
          // Get recent courses (first 3)
          setRecentCourses(progressResponse.data.slice(0, 3));
        } catch (error) {
          console.error('Failed to load progress:', error);
          // Try to load from cache
          const cachedProgress = await getCachedData('userProgress');
          if (cachedProgress) {
            setProgress(cachedProgress);
            setRecentCourses(cachedProgress.slice(0, 3));
          }
        }
      } else {
        // Load from cache when offline
        const cachedStats = await getCachedData('userStats');
        const cachedProgress = await getCachedData('userProgress');
        
        if (cachedStats) setStats(cachedStats);
        if (cachedProgress) {
          setProgress(cachedProgress);
          setRecentCourses(cachedProgress.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="student-dashboard">
      <div className="container py-4">
        {/* Welcome Header */}
        <div className="dashboard-header mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-6 fw-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="lead text-muted mb-0">
                Continue your learning journey and track your progress
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
                {isOnline ? `Online (${getConnectionQuality()})` : 'Offline Mode'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-primary">
                <i className="bi bi-book"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.enrolledCourses}</h3>
                <p className="stat-label">Enrolled Courses</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.completedCourses}</h3>
                <p className="stat-label">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-warning">
                <i className="bi bi-clock"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.inProgressCourses}</h3>
                <p className="stat-label">In Progress</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-info">
                <i className="bi bi-graph-up"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{Math.round(stats.averageCompletion)}%</h3>
                <p className="stat-label">Avg. Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Courses */}
          <div className="col-lg-8 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Continue Learning
                </h5>
                <Link to="/courses" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {recentCourses.length > 0 ? (
                  <div className="row g-3">
                    {recentCourses.map((courseProgress) => (
                      <div key={courseProgress.id} className="col-md-6">
                        <div className="course-progress-card">
                          <div className="course-info">
                            <h6 className="course-title">
                              {courseProgress.courseTitle || 'Course Title'}
                            </h6>
                            <div className="progress mb-2" style={{ height: '6px' }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${courseProgress.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                {Math.round(courseProgress.completionPercentage || 0)}% Complete
                              </small>
                              <Link
                                to={`/courses/${courseProgress.courseId}`}
                                className="btn btn-sm btn-primary"
                              >
                                Continue
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-book display-4 text-muted mb-3"></i>
                    <h6>No courses yet</h6>
                    <p className="text-muted">Start learning by enrolling in a course</p>
                    <Link to="/courses" className="btn btn-primary">
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-lightning me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  <Link to="/courses" className="btn btn-outline-primary">
                    <i className="bi bi-search me-2"></i>
                    Browse Courses
                  </Link>
                  
                  <Link to="/profile" className="btn btn-outline-secondary">
                    <i className="bi bi-person me-2"></i>
                    Edit Profile
                  </Link>
                  
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Data
                  </button>
                  
                  {!isOnline && (
                    <div className="alert alert-warning mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      <small>
                        You're offline. Some features may be limited.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 2rem;
        }

        .connection-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .connection-status.online {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
          border: 1px solid rgba(40, 167, 69, 0.2);
        }

        .connection-status.offline {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
          border: 1px solid rgba(220, 53, 69, 0.2);
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--dark-color);
        }

        .stat-label {
          color: #6c757d;
          margin: 0;
          font-weight: 500;
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          border-radius: 15px 15px 0 0 !important;
          padding: 1.25rem;
        }

        .course-progress-card {
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 10px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .course-progress-card:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .course-title {
          color: var(--dark-color);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .progress {
          background-color: #e9ecef;
          border-radius: 3px;
        }

        .progress-bar {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            text-align: center;
            padding: 1.5rem;
          }
          
          .connection-status {
            margin-top: 1rem;
            display: inline-block;
          }
          
          .stat-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
