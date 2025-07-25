import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { coursesAPI, lessonsAPI, progressAPI, offlineAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { isOnline, canLoadImages } = useNetwork();
  const { getCachedData, cacheData, preloadContent } = useOffline();

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // Load course details
      const courseResult = await offlineAPI.request(
        () => coursesAPI.getCourse(id),
        null,
        `course-${id}`
      );

      if (courseResult.data) {
        setCourse(courseResult.data);
        
        // Cache course data
        if (isOnline && !courseResult.fromCache) {
          await cacheData('courses', courseResult.data);
        }
      }

      // Load lessons
      const lessonsResult = await offlineAPI.request(
        () => lessonsAPI.getLessonsByCourse(id),
        [],
        `lessons-${id}`
      );

      setLessons(lessonsResult.data);

      // Load progress if authenticated
      if (isAuthenticated()) {
        try {
          const progressResult = await offlineAPI.request(
            () => progressAPI.getMyProgressForCourse(id),
            null,
            `progress-${id}-${user?.id}`
          );

          if (progressResult.data) {
            setProgress(progressResult.data);
            setIsEnrolled(true);
          }
        } catch (error) {
          // User not enrolled yet
          setIsEnrolled(false);
        }
      }

      // Preload content for offline use
      if (isOnline) {
        preloadContent(id);
      }

    } catch (error) {
      console.error('Failed to load course data:', error);
      
      // Try loading from cache
      try {
        const cachedCourse = await getCachedData('courses', id);
        const cachedLessons = await getCachedData('lessons');
        
        if (cachedCourse) setCourse(cachedCourse);
        if (cachedLessons) {
          const courseLessons = cachedLessons.filter(l => l.courseId === parseInt(id));
          setLessons(courseLessons);
        }
      } catch (cacheError) {
        console.error('Failed to load cached data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (!isOnline) {
      alert('Enrollment requires an internet connection. Please try again when online.');
      return;
    }

    try {
      setEnrolling(true);
      const result = await progressAPI.enrollInCourse(id);
      
      if (result.data.success) {
        setIsEnrolled(true);
        setProgress(result.data.data);
        // Refresh course data
        await loadCourseData();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'VIDEO': return 'bi-play-circle';
      case 'TEXT': return 'bi-file-text';
      case 'INTERACTIVE': return 'bi-cursor';
      case 'QUIZ': return 'bi-question-circle';
      case 'DIAGRAM': return 'bi-diagram-3';
      default: return 'bi-file';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle display-1 text-muted"></i>
          <h3>Course Not Found</h3>
          <p className="text-muted">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="container py-4">
        {/* Course Header */}
        <div className="course-header mb-5">
          <div className="row">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/courses" className="text-white">Courses</Link>
                  </li>
                  <li className="breadcrumb-item active text-white-50" aria-current="page">
                    {course.title}
                  </li>
                </ol>
              </nav>
              
              <h1 className="display-5 fw-bold mb-3">{course.title}</h1>
              <p className="lead mb-4">{course.description}</p>
              
              <div className="course-meta-info">
                <div className="row g-3">
                  <div className="col-auto">
                    <span className={`badge bg-${getDifficultyColor(course.difficulty)} fs-6`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-light text-dark fs-6">
                      <i className="bi bi-tag me-1"></i>
                      {course.category}
                    </span>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-light text-dark fs-6">
                      <i className="bi bi-clock me-1"></i>
                      {course.estimatedDuration || 60} minutes
                    </span>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-light text-dark fs-6">
                      <i className="bi bi-list-ol me-1"></i>
                      {lessons.length} lessons
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="course-actions">
                {isAuthenticated() ? (
                  isEnrolled ? (
                    <div className="enrolled-status">
                      <div className="card bg-success text-white mb-3">
                        <div className="card-body text-center">
                          <i className="bi bi-check-circle display-6 mb-2"></i>
                          <h5>You're Enrolled!</h5>
                          {progress && (
                            <div className="progress bg-light mb-2" style={{ height: '8px' }}>
                              <div
                                className="progress-bar bg-white"
                                style={{ width: `${progress.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          )}
                          <p className="mb-0">
                            {Math.round(progress?.completionPercentage || 0)}% Complete
                          </p>
                        </div>
                      </div>
                      
                      {lessons.length > 0 && (
                        <Link
                          to={`/lesson/${lessons[0].id}`}
                          className="btn btn-light btn-lg w-100"
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          {progress?.completionPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="enrollment-card">
                      <div className="card">
                        <div className="card-body text-center">
                          <h5 className="card-title">Ready to Start Learning?</h5>
                          <p className="card-text text-muted">
                            Enroll now to access all lessons and track your progress
                          </p>
                          <button
                            className="btn btn-primary btn-lg w-100"
                            onClick={handleEnroll}
                            disabled={enrolling || !isOnline}
                          >
                            {enrolling ? (
                              <>
                                <LoadingSpinner size="small" />
                                <span className="ms-2">Enrolling...</span>
                              </>
                            ) : (
                              <>
                                <i className="bi bi-plus-circle me-2"></i>
                                Enroll Now
                              </>
                            )}
                          </button>
                          
                          {!isOnline && (
                            <small className="text-muted d-block mt-2">
                              <i className="bi bi-wifi-off me-1"></i>
                              Enrollment requires internet connection
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="login-prompt">
                    <div className="card">
                      <div className="card-body text-center">
                        <h5 className="card-title">Join to Access Course</h5>
                        <p className="card-text text-muted">
                          Sign in or create an account to enroll in this course
                        </p>
                        <Link
                          to="/login"
                          state={{ from: { pathname: `/courses/${id}` } }}
                          className="btn btn-primary btn-lg w-100 mb-2"
                        >
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="btn btn-outline-primary w-100"
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="row">
          {/* Lessons List */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Course Content
                </h5>
              </div>
              <div className="card-body p-0">
                {lessons.length > 0 ? (
                  <div className="lessons-list">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="lesson-item">
                        <div className="lesson-content">
                          <div className="lesson-icon">
                            <i className={`bi ${getLessonIcon(lesson.type)}`}></i>
                          </div>
                          <div className="lesson-info">
                            <h6 className="lesson-title">{lesson.title}</h6>
                            <div className="lesson-meta">
                              <span className="lesson-type">{lesson.type}</span>
                              {lesson.durationMinutes && (
                                <span className="lesson-duration">
                                  <i className="bi bi-clock me-1"></i>
                                  {lesson.durationMinutes} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="lesson-actions">
                          {isEnrolled ? (
                            <Link
                              to={`/lesson/${lesson.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-play me-1"></i>
                              {lesson.type === 'QUIZ' ? 'Take Quiz' : 'View'}
                            </Link>
                          ) : (
                            <button className="btn btn-sm btn-outline-secondary" disabled>
                              <i className="bi bi-lock me-1"></i>
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-file-earmark display-4 text-muted"></i>
                    <p className="text-muted mt-2">No lessons available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Info Sidebar */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Course Information
                </h5>
              </div>
              <div className="card-body">
                <div className="course-stats">
                  <div className="stat-item">
                    <i className="bi bi-person text-primary"></i>
                    <div>
                      <strong>Instructor</strong>
                      <p className="mb-0 text-muted">{course.teacherName || 'Course Instructor'}</p>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <i className="bi bi-calendar text-primary"></i>
                    <div>
                      <strong>Created</strong>
                      <p className="mb-0 text-muted">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <i className="bi bi-clock text-primary"></i>
                    <div>
                      <strong>Duration</strong>
                      <p className="mb-0 text-muted">{course.estimatedDuration || 60} minutes</p>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <i className="bi bi-list-ol text-primary"></i>
                    <div>
                      <strong>Lessons</strong>
                      <p className="mb-0 text-muted">{lessons.length} lessons</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Notice */}
            {!isOnline && (
              <div className="alert alert-warning mt-3">
                <i className="bi bi-wifi-off me-2"></i>
                <strong>Offline Mode:</strong> Some features may be limited.
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .course-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
        }

        .breadcrumb {
          background: none;
          padding: 0;
        }

        .breadcrumb-item + .breadcrumb-item::before {
          color: rgba(255, 255, 255, 0.5);
        }

        .course-meta-info .badge {
          padding: 0.5rem 1rem;
          font-weight: 500;
        }

        .course-actions .card {
          border: none;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-radius: 15px;
        }

        .lessons-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .lesson-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .lesson-item:hover {
          background-color: #f8f9fa;
        }

        .lesson-item:last-child {
          border-bottom: none;
        }

        .lesson-content {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .lesson-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .lesson-info {
          flex: 1;
        }

        .lesson-title {
          margin-bottom: 0.25rem;
          font-weight: 600;
          color: var(--dark-color);
        }

        .lesson-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .lesson-type {
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .course-stats .stat-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .course-stats .stat-item:last-child {
          margin-bottom: 0;
        }

        .course-stats .stat-item i {
          font-size: 1.25rem;
          margin-right: 1rem;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        .course-stats .stat-item strong {
          display: block;
          margin-bottom: 0.25rem;
          color: var(--dark-color);
        }

        @media (max-width: 768px) {
          .course-header {
            text-align: center;
            padding: 2rem 1rem;
          }
          
          .course-actions {
            margin-top: 2rem;
          }
          
          .lesson-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .lesson-actions {
            width: 100%;
          }
          
          .lesson-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
