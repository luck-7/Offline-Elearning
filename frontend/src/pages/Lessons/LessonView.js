import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { lessonsAPI, progressAPI, offlineAPI } from '../../utils/api';
import DrawingCanvas from '../../components/Canvas/DrawingCanvas';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextLesson, setNextLesson] = useState(null);
  const [previousLesson, setPreviousLesson] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);

  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const { getCachedData, updateProgressOffline } = useOffline();
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    loadLessonData();
    startTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      saveProgress();
    };
  }, [id]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Load lesson details
      const lessonResult = await offlineAPI.request(
        () => lessonsAPI.getLesson(id),
        null,
        `lesson-${id}`
      );

      if (lessonResult.data) {
        setLesson(lessonResult.data);
        
        // Load navigation lessons
        if (lessonResult.data.courseId) {
          try {
            const nextResult = await offlineAPI.request(
              () => lessonsAPI.getNextLessons(lessonResult.data.courseId, lessonResult.data.lessonOrder),
              [],
              `next-lessons-${lessonResult.data.courseId}-${lessonResult.data.lessonOrder}`
            );
            
            if (nextResult.data.length > 0) {
              setNextLesson(nextResult.data[0]);
            }

            const prevResult = await offlineAPI.request(
              () => lessonsAPI.getPreviousLessons(lessonResult.data.courseId, lessonResult.data.lessonOrder),
              [],
              `prev-lessons-${lessonResult.data.courseId}-${lessonResult.data.lessonOrder}`
            );
            
            if (prevResult.data.length > 0) {
              setPreviousLesson(prevResult.data[prevResult.data.length - 1]);
            }
          } catch (navError) {
            console.error('Failed to load navigation lessons:', navError);
          }
        }
      }

    } catch (error) {
      console.error('Failed to load lesson:', error);
      
      // Try loading from cache
      try {
        const cachedLesson = await getCachedData('lessons', id);
        if (cachedLesson) {
          setLesson(cachedLesson);
        }
      } catch (cacheError) {
        console.error('Failed to load cached lesson:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!lesson || savingProgress) return;

    try {
      setSavingProgress(true);
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
      
      const progressData = {
        lessonId: lesson.id,
        courseId: lesson.courseId,
        timeSpentMinutes: Math.max(currentTime, 1),
        completed: isCompleted
      };

      if (isOnline) {
        await progressAPI.saveLessonProgress(progressData);
      } else {
        // Save offline for later sync
        await updateProgressOffline(progressData);
      }

    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleted(true);
    await saveProgress();
  };

  const handleCanvasSave = (imageData) => {
    // Save drawing to local storage or send to server
    localStorage.setItem(`drawing-${lesson.id}`, imageData);
    console.log('Drawing saved for lesson:', lesson.id);
  };

  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'TEXT':
        return (
          <div className="lesson-text-content">
            <div 
              className="content-body"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        );

      case 'VIDEO':
        return (
          <div className="lesson-video-content">
            {lesson.videoUrl ? (
              <div className="video-container">
                <video 
                  controls 
                  className="w-100"
                  style={{ maxHeight: '500px' }}
                  onEnded={() => setIsCompleted(true)}
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="video-placeholder">
                <i className="bi bi-play-circle display-1 text-muted"></i>
                <p className="text-muted">Video content will be available when online</p>
              </div>
            )}
            <div className="mt-4">
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          </div>
        );

      case 'INTERACTIVE':
        return (
          <div className="lesson-interactive-content">
            <div className="mb-4">
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
            
            <div className="interactive-section">
              <h5>Interactive Drawing Exercise</h5>
              <p className="text-muted mb-3">
                Use the canvas below to complete the drawing exercise. Your work will be saved automatically.
              </p>
              <DrawingCanvas
                width={800}
                height={400}
                onSave={handleCanvasSave}
                initialImage={localStorage.getItem(`drawing-${lesson.id}`)}
              />
            </div>
          </div>
        );

      case 'DIAGRAM':
        return (
          <div className="lesson-diagram-content">
            <div className="mb-4">
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
            
            {lesson.imageUrl && (
              <div className="diagram-container text-center">
                <img 
                  src={lesson.imageUrl} 
                  alt="Lesson Diagram"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            )}
          </div>
        );

      case 'QUIZ':
        return (
          <div className="lesson-quiz-content">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              This lesson contains a quiz. Click the button below to take the quiz.
            </div>
            <div className="text-center">
              <Link 
                to={`/quiz/${lesson.id}`}
                className="btn btn-primary btn-lg"
              >
                <i className="bi bi-question-circle me-2"></i>
                Take Quiz
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div className="lesson-default-content">
            <div 
              className="content-body"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading lesson..." />;
  }

  if (!lesson) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle display-1 text-muted"></i>
          <h3>Lesson Not Found</h3>
          <p className="text-muted">The lesson you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-view-page">
      <div className="container py-4">
        {/* Lesson Header */}
        <div className="lesson-header mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/courses">Courses</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={`/courses/${lesson.courseId}`}>Course</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {lesson.title}
                  </li>
                </ol>
              </nav>
              
              <h1 className="display-6 fw-bold mb-2">{lesson.title}</h1>
              
              <div className="lesson-meta">
                <span className="badge bg-primary me-2">
                  {lesson.type}
                </span>
                {lesson.durationMinutes && (
                  <span className="badge bg-secondary me-2">
                    <i className="bi bi-clock me-1"></i>
                    {lesson.durationMinutes} min
                  </span>
                )}
                <span className="badge bg-info">
                  <i className="bi bi-stopwatch me-1"></i>
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <div className="col-lg-4 text-lg-end">
              <div className="lesson-actions">
                {!isCompleted && (
                  <button
                    className="btn btn-success me-2"
                    onClick={handleMarkComplete}
                    disabled={savingProgress}
                  >
                    {savingProgress ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ms-2">Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Mark Complete
                      </>
                    )}
                  </button>
                )}
                
                {isCompleted && (
                  <span className="badge bg-success fs-6 me-2">
                    <i className="bi bi-check-circle me-1"></i>
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="row">
          <div className="col-lg-9">
            <div className="lesson-content-card">
              {renderLessonContent()}
            </div>
          </div>
          
          <div className="col-lg-3">
            <div className="lesson-sidebar">
              {/* Progress Card */}
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Your Progress
                  </h6>
                </div>
                <div className="card-body text-center">
                  <div className="progress-circle mb-3">
                    <div className="circle">
                      <div className="circle-inner">
                        <span className="percentage">
                          {isCompleted ? '100%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted mb-0">
                    Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                  </p>
                </div>
              </div>

              {/* Resources */}
              {lesson.resources && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-file-earmark me-2"></i>
                      Resources
                    </h6>
                  </div>
                  <div className="card-body">
                    <div 
                      dangerouslySetInnerHTML={{ __html: lesson.resources }}
                    />
                  </div>
                </div>
              )}

              {/* Offline Status */}
              {!isOnline && (
                <div className="alert alert-warning">
                  <i className="bi bi-wifi-off me-2"></i>
                  <small>
                    You're offline. Progress will sync when online.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="lesson-navigation mt-5">
          <div className="row">
            <div className="col-6">
              {previousLesson && (
                <Link
                  to={`/lesson/${previousLesson.id}`}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Previous: {previousLesson.title}
                </Link>
              )}
            </div>
            <div className="col-6 text-end">
              {nextLesson && (
                <Link
                  to={`/lesson/${nextLesson.id}`}
                  className="btn btn-primary"
                >
                  Next: {nextLesson.title}
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lesson-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
        }

        .breadcrumb {
          background: none;
          padding: 0;
        }

        .breadcrumb-item a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
        }

        .breadcrumb-item a:hover {
          color: white;
        }

        .breadcrumb-item + .breadcrumb-item::before {
          color: rgba(255, 255, 255, 0.5);
        }

        .lesson-content-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          min-height: 500px;
        }

        .content-body {
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .content-body h1, .content-body h2, .content-body h3 {
          color: var(--primary-color);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .content-body p {
          margin-bottom: 1.5rem;
        }

        .video-container {
          background: #000;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .video-placeholder {
          background: #f8f9fa;
          padding: 3rem;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 2rem;
        }

        .interactive-section {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 10px;
          margin-top: 2rem;
        }

        .diagram-container {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 10px;
          margin-top: 2rem;
        }

        .progress-circle {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }

        .circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(var(--primary-color) 0deg, #e9ecef 0deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .circle-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .percentage {
          font-weight: 700;
          color: var(--primary-color);
        }

        .lesson-navigation .btn {
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .lesson-header {
            text-align: center;
            padding: 1.5rem;
          }
          
          .lesson-actions {
            margin-top: 1rem;
          }
          
          .lesson-content-card {
            padding: 1.5rem;
          }
          
          .lesson-navigation .btn {
            width: 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LessonView;
