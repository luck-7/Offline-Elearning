import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { quizAPI, offlineAPI } from '../../utils/api';
import DrawingCanvas from '../../components/Canvas/DrawingCanvas';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [canvasAnswer, setCanvasAnswer] = useState('');

  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const { submitQuizOffline, getCachedData } = useOffline();
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    loadQuizData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.timeLimitSeconds && !isSubmitted) {
      setTimeLeft(quiz.timeLimitSeconds);
      startTimer();
    }
  }, [quiz, isSubmitted]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Check if already submitted
      if (isOnline) {
        try {
          const resultResponse = await quizAPI.getMyResult(id);
          if (resultResponse.data) {
            setResult(resultResponse.data);
            setIsSubmitted(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          // Quiz not submitted yet, continue loading
        }
      }

      // Load quiz details
      const quizResult = await offlineAPI.request(
        () => quizAPI.getQuiz(id),
        null,
        `quiz-${id}`
      );

      if (quizResult.data) {
        setQuiz(quizResult.data);
        startTimeRef.current = Date.now();
      }

    } catch (error) {
      console.error('Failed to load quiz:', error);
      
      // Try loading from cache
      try {
        const cachedQuiz = await getCachedData('quizzes', id);
        if (cachedQuiz) {
          setQuiz(cachedQuiz);
        }
      } catch (cacheError) {
        console.error('Failed to load cached quiz:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting || isSubmitted) return;

    let finalAnswer = userAnswer;
    
    // Handle different quiz types
    switch (quiz.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        finalAnswer = selectedOption;
        break;
      case 'FILL_BLANK':
        finalAnswer = userAnswer.trim();
        break;
      case 'DRAWING':
        finalAnswer = canvasAnswer;
        break;
      case 'MATCHING':
        finalAnswer = JSON.stringify(userAnswer);
        break;
      default:
        finalAnswer = userAnswer;
    }

    if (!finalAnswer && !autoSubmit) {
      alert('Please provide an answer before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const submission = {
        quizId: quiz.id,
        userAnswer: finalAnswer,
        timeTakenSeconds: timeTaken
      };

      if (isOnline) {
        const response = await quizAPI.submitQuiz(submission);
        setResult(response.data.data);
      } else {
        // Submit offline for later sync
        await submitQuizOffline(submission);
        // Create mock result for offline display
        setResult({
          id: Date.now(),
          userAnswer: finalAnswer,
          isCorrect: null, // Will be determined when synced
          pointsEarned: 0,
          timeTakenSeconds: timeTaken,
          submittedAt: new Date().toISOString(),
          offline: true
        });
      }

      setIsSubmitted(true);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCanvasSave = (imageData) => {
    setCanvasAnswer(imageData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuizContent = () => {
    if (!quiz) return null;

    switch (quiz.type) {
      case 'MULTIPLE_CHOICE':
        const options = JSON.parse(quiz.options || '[]');
        return (
          <div className="quiz-multiple-choice">
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-item">
                  <label className="option-label">
                    <input
                      type="radio"
                      name="quiz-option"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={isSubmitted}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="quiz-true-false">
            <div className="options-list">
              <div className="option-item">
                <label className="option-label">
                  <input
                    type="radio"
                    name="quiz-option"
                    value="True"
                    checked={selectedOption === 'True'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    disabled={isSubmitted}
                  />
                  <span className="option-text">True</span>
                </label>
              </div>
              <div className="option-item">
                <label className="option-label">
                  <input
                    type="radio"
                    name="quiz-option"
                    value="False"
                    checked={selectedOption === 'False'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    disabled={isSubmitted}
                  />
                  <span className="option-text">False</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'FILL_BLANK':
        return (
          <div className="quiz-fill-blank">
            <div className="form-group">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitted}
              />
            </div>
          </div>
        );

      case 'DRAWING':
        return (
          <div className="quiz-drawing">
            <p className="text-muted mb-3">
              Use the canvas below to draw your answer. Your drawing will be submitted as your response.
            </p>
            <DrawingCanvas
              width={600}
              height={400}
              onSave={handleCanvasSave}
              className={isSubmitted ? 'disabled' : ''}
            />
          </div>
        );

      default:
        return (
          <div className="quiz-default">
            <div className="form-group">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitted}
              />
            </div>
          </div>
        );
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="quiz-result">
        <div className={`alert ${result.offline ? 'alert-info' : (result.isCorrect ? 'alert-success' : 'alert-danger')}`}>
          <div className="result-header">
            <h4 className="mb-2">
              {result.offline ? (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Submitted Offline
                </>
              ) : result.isCorrect ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Correct!
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle me-2"></i>
                  Incorrect
                </>
              )}
            </h4>
            
            {!result.offline && (
              <p className="mb-2">
                You earned <strong>{result.pointsEarned}</strong> out of <strong>{quiz.points}</strong> points.
              </p>
            )}
            
            <p className="mb-0">
              Time taken: <strong>{formatTime(result.timeTakenSeconds)}</strong>
            </p>
          </div>
        </div>

        {result.offline && (
          <div className="alert alert-warning">
            <i className="bi bi-info-circle me-2"></i>
            Your answer has been saved and will be graded when you're back online.
          </div>
        )}

        {quiz.explanation && !result.offline && (
          <div className="explanation-section">
            <h5>Explanation</h5>
            <div className="explanation-content">
              {quiz.explanation}
            </div>
          </div>
        )}

        <div className="result-actions mt-4">
          <Link to={`/courses/${quiz.courseId || quiz.lesson?.courseId}`} className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle display-1 text-muted"></i>
          <h3>Quiz Not Found</h3>
          <p className="text-muted">The quiz you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-view-page">
      <div className="container py-4">
        {/* Timer */}
        {timeLeft !== null && !isSubmitted && (
          <div className="quiz-timer">
            <div className="timer-card">
              <i className="bi bi-stopwatch me-2"></i>
              <span className={timeLeft < 60 ? 'text-danger' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}

        {/* Quiz Header */}
        <div className="quiz-header mb-4">
          <div className="container">
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/courses" className="text-white">Courses</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/courses/${quiz.courseId || quiz.lesson?.courseId}`} className="text-white">
                    Course
                  </Link>
                </li>
                <li className="breadcrumb-item active text-white-50" aria-current="page">
                  Quiz
                </li>
              </ol>
            </nav>
            
            <h1 className="display-6 fw-bold mb-2">{quiz.title}</h1>
            <div className="quiz-meta">
              <span className="badge bg-light text-dark me-2">
                <i className="bi bi-star me-1"></i>
                {quiz.points} points
              </span>
              <span className="badge bg-light text-dark">
                <i className="bi bi-question-circle me-1"></i>
                {quiz.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="quiz-card">
              {isSubmitted ? (
                renderResult()
              ) : (
                <>
                  <div className="quiz-question">
                    <h3 className="question-text">{quiz.question}</h3>
                  </div>

                  <div className="quiz-content">
                    {renderQuizContent()}
                  </div>

                  <div className="quiz-actions">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => handleSubmit()}
                      disabled={submitting || !isOnline && quiz.type === 'DRAWING'}
                    >
                      {submitting ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ms-2">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Submit Answer
                        </>
                      )}
                    </button>

                    {!isOnline && (
                      <div className="offline-notice mt-3">
                        <i className="bi bi-wifi-off me-2"></i>
                        <small className="text-muted">
                          You're offline. Your answer will be submitted when you're back online.
                        </small>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .quiz-timer {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 1000;
        }

        .timer-card {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 25px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .quiz-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 2rem 0;
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

        .breadcrumb-item + .breadcrumb-item::before {
          color: rgba(255, 255, 255, 0.5);
        }

        .quiz-card {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .quiz-question {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #e9ecef;
        }

        .question-text {
          color: var(--dark-color);
          line-height: 1.4;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .option-item {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .option-item:hover {
          border-color: var(--primary-color);
          background: rgba(102, 126, 234, 0.05);
        }

        .option-label {
          display: flex;
          align-items: center;
          padding: 1.25rem;
          cursor: pointer;
          margin: 0;
          width: 100%;
        }

        .option-label input[type="radio"] {
          margin-right: 1rem;
          transform: scale(1.2);
        }

        .option-text {
          flex: 1;
          font-size: 1.1rem;
        }

        .form-control {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 1rem;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .quiz-actions {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #e9ecef;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border: none;
          border-radius: 10px;
          padding: 1rem 2rem;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .quiz-result .alert {
          border: none;
          border-radius: 15px;
          padding: 2rem;
        }

        .result-header h4 {
          margin-bottom: 1rem;
        }

        .explanation-section {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 15px;
          margin-top: 2rem;
        }

        .explanation-content {
          line-height: 1.6;
          color: var(--dark-color);
        }

        .offline-notice {
          text-align: center;
        }

        @media (max-width: 768px) {
          .quiz-timer {
            position: static;
            margin-bottom: 1rem;
            text-align: center;
          }
          
          .timer-card {
            display: inline-block;
          }
          
          .quiz-card {
            padding: 2rem 1.5rem;
          }
          
          .option-label {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizView;
