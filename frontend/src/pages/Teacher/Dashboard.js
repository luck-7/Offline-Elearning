import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { coursesAPI, progressAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    avgCompletion: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  const { user } = useAuth();
  const { isOnline, getConnectionQuality } = useNetwork();
  const { getCachedData, cacheData } = useOffline();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isOnline) {
        try {
          // Load teacher's courses
          const coursesResponse = await coursesAPI.getMyCourses();
          const courses = coursesResponse.data;
          setMyCourses(courses);
          setRecentCourses(courses.slice(0, 3));
          await cacheData('teacherCourses', courses);

          // Calculate stats
          const publishedCount = courses.filter(c => c.isPublished).length;
          const totalStudents = courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);
          
          const calculatedStats = {
            totalCourses: courses.length,
            publishedCourses: publishedCount,
            totalStudents: totalStudents,
            avgCompletion: Math.round(Math.random() * 30 + 70) // Mock data
          };
          
          setStats(calculatedStats);
          await cacheData('teacherStats', calculatedStats);

        } catch (error) {
          console.error('Failed to load teacher data:', error);
          // Try to load from cache
          const cachedCourses = await getCachedData('teacherCourses');
          const cachedStats = await getCachedData('teacherStats');
          
          if (cachedCourses) {
            setMyCourses(cachedCourses);
            setRecentCourses(cachedCourses.slice(0, 3));
          }
          if (cachedStats) {
            setStats(cachedStats);
          }
        }
      } else {
        // Load from cache when offline
        const cachedCourses = await getCachedData('teacherCourses');
        const cachedStats = await getCachedData('teacherStats');
        
        if (cachedCourses) {
          setMyCourses(cachedCourses);
          setRecentCourses(cachedCourses.slice(0, 3));
        }
        if (cachedStats) {
          setStats(cachedStats);
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
    <div className="teacher-dashboard">
      <div className="container py-4">
        {/* Welcome Header */}
        <div className="dashboard-header mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-6 fw-bold mb-2">
                Welcome, Professor {user?.firstName}! 🎓
              </h1>
              <p className="lead text-muted mb-0">
                Manage your courses and track student progress
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
                <i className="bi bi-book-half"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalCourses}</h3>
                <p className="stat-label">Total Courses</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-success">
                <i className="bi bi-globe"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.publishedCourses}</h3>
                <p className="stat-label">Published</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-info">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalStudents}</h3>
                <p className="stat-label">Students</p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="stat-icon bg-warning">
                <i className="bi bi-graph-up"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.avgCompletion}%</h3>
                <p className="stat-label">Avg. Completion</p>
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
                  <i className="bi bi-collection me-2"></i>
                  My Courses
                </h5>
                <Link to="/teacher/courses/new" className="btn btn-sm btn-primary">
                  <i className="bi bi-plus me-1"></i>
                  New Course
                </Link>
              </div>
              <div className="card-body">
                {recentCourses.length > 0 ? (
                  <div className="row g-3">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="col-md-6">
                        <div className="course-card">
                          <div className="course-header">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="course-title">{course.title}</h6>
                              <span className={`badge ${course.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                                {course.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <p className="course-description">
                              {course.description?.substring(0, 80)}...
                            </p>
                          </div>
                          <div className="course-meta">
                            <small className="text-muted">
                              <i className="bi bi-people me-1"></i>
                              {course.enrolledStudents || 0} students
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {course.estimatedDuration || 60} min
                            </small>
                          </div>
                          <div className="course-actions mt-2">
                            <Link
                              to={`/teacher/courses/${course.id}`}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </Link>
                            <Link
                              to={`/courses/${course.id}`}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-book display-4 text-muted mb-3"></i>
                    <h6>No courses yet</h6>
                    <p className="text-muted">Create your first course to get started</p>
                    <Link to="/teacher/courses/new" className="btn btn-primary">
                      <i className="bi bi-plus me-2"></i>
                      Create Course
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Tools */}
          <div className="col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-tools me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  <Link to="/teacher/courses/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Course
                  </Link>
                  
                  <Link to="/teacher/lessons/new" className="btn btn-outline-primary">
                    <i className="bi bi-file-plus me-2"></i>
                    Add Lesson
                  </Link>
                  
                  <Link to="/teacher/quizzes/new" className="btn btn-outline-secondary">
                    <i className="bi bi-question-circle me-2"></i>
                    Create Quiz
                  </Link>
                  
                  <Link to="/teacher/analytics" className="btn btn-outline-info">
                    <i className="bi bi-graph-up me-2"></i>
                    View Analytics
                  </Link>
                  
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Data
                  </button>
                  
                  {!isOnline && (
                    <div className="alert alert-warning mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      <small>
                        You're offline. Course creation requires internet connection.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-activity me-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div className="card-body">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon bg-primary">
                      <i className="bi bi-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-1">Course "React Fundamentals" was created</p>
                      <small className="text-muted">2 hours ago</small>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon bg-success">
                      <i className="bi bi-person-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-1">5 new students enrolled in "JavaScript Basics"</p>
                      <small className="text-muted">1 day ago</small>
                    </div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-icon bg-info">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-1">Quiz "Variables and Functions" completed by 12 students</p>
                      <small className="text-muted">2 days ago</small>
                    </div>
                  </div>
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

        .course-card {
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 10px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          height: 100%;
        }

        .course-card:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .course-title {
          color: var(--dark-color);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .course-description {
          color: #6c757d;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .activity-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin-bottom: 0.25rem;
          font-weight: 500;
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
          
          .course-actions .btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
