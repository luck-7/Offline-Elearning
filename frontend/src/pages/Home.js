import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useIntersectionObserver';
import { useNetwork } from '../hooks/useNetwork';
import { coursesAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0
  });

  const { isOnline, getConnectionQuality } = useNetwork();
  const { targetRef: heroRef, hasAnimated: heroAnimated } = useScrollAnimation();
  const { targetRef: featuresRef, hasAnimated: featuresAnimated } = useScrollAnimation();
  const { targetRef: coursesRef, hasAnimated: coursesAnimated } = useScrollAnimation();

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      const response = await coursesAPI.getPublicCourses();
      const courses = response.data;
      
      // Take first 3 courses as featured
      setFeaturedCourses(courses.slice(0, 3));
      
      // Calculate stats
      setStats({
        totalCourses: courses.length,
        totalStudents: Math.floor(Math.random() * 1000) + 500, // Mock data
        totalLessons: courses.length * 8 // Estimate
      });
    } catch (error) {
      console.error('Failed to load featured courses:', error);
      
      // Try to load from cache if offline
      if (!isOnline) {
        try {
          const cachedCourses = await getCachedCourses();
          if (cachedCourses) {
            setFeaturedCourses(cachedCourses.slice(0, 3));
          }
        } catch (cacheError) {
          console.error('Failed to load cached courses:', cacheError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getCachedCourses = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eLearningDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['courses'], 'readonly');
        const store = transaction.objectStore('courses');
        const getRequest = store.getAll();
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading homepage..." />;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`hero-section ${heroAnimated ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
      >
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">
                  Learn Anywhere, 
                  <span className="text-primary"> Anytime</span>
                  <br />
                  <span className="text-secondary">Even Offline!</span>
                </h1>
                <p className="lead mb-4">
                  Experience the future of learning with our offline-ready eLearning portal. 
                  Access interactive lessons, take quizzes, and track your progress even 
                  without an internet connection.
                </p>
                
                <div className="hero-features mb-4">
                  <div className="feature-item">
                    <i className="bi bi-wifi-off text-primary"></i>
                    <span>Offline Learning</span>
                  </div>
                  <div className="feature-item">
                    <i className="bi bi-palette text-primary"></i>
                    <span>Interactive Content</span>
                  </div>
                  <div className="feature-item">
                    <i className="bi bi-graph-up text-primary"></i>
                    <span>Progress Tracking</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <Link to="/courses" className="btn btn-primary btn-lg me-3">
                    <i className="bi bi-book me-2"></i>
                    Explore Courses
                  </Link>
                  <Link to="/register" className="btn btn-outline-primary btn-lg">
                    <i className="bi bi-person-plus me-2"></i>
                    Get Started
                  </Link>
                </div>

                {/* Network Status */}
                <div className="network-status mt-4">
                  <div className={`alert ${isOnline ? 'alert-success' : 'alert-warning'} d-inline-flex align-items-center`}>
                    <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
                    {isOnline ? (
                      <span>Online - Full features available ({getConnectionQuality()})</span>
                    ) : (
                      <span>Offline - Limited features available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="hero-image">
                <div className="floating-card">
                  <i className="bi bi-mortarboard-fill fs-1 text-primary mb-3"></i>
                  <h4>Smart Learning</h4>
                  <p>AI-powered content adaptation based on your connection speed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <div className="stat-number">{stats.totalCourses}+</div>
                <div className="stat-label">Courses Available</div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <div className="stat-number">{stats.totalStudents}+</div>
                <div className="stat-label">Active Students</div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <div className="stat-number">{stats.totalLessons}+</div>
                <div className="stat-label">Interactive Lessons</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className={`features-section py-5 ${featuresAnimated ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center mb-5">
              <h2 className="display-5 fw-bold">Why Choose Our Platform?</h2>
              <p className="lead text-muted">
                Built for the modern learner with cutting-edge offline capabilities
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-cloud-download"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Offline-First Design</h4>
                  <p>
                    Download lessons and continue learning even without internet.
                    Your progress syncs automatically when you're back online.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      No Internet Required
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Auto Sync
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-palette2"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Interactive Learning</h4>
                  <p>
                    Engage with visual quizzes, drawing exercises, and interactive
                    diagrams powered by HTML5 Canvas technology.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Visual Quizzes
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Canvas Drawing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-speedometer2"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Adaptive Performance</h4>
                  <p>
                    Smart content delivery that adapts to your connection speed.
                    Get the best experience regardless of your network quality.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Smart Delivery
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Quality Adaptive
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Progress Tracking</h4>
                  <p>
                    Visual progress indicators and detailed analytics help you
                    stay motivated and track your learning journey.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Visual Analytics
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Motivation Tools
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-people"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Role-Based Learning</h4>
                  <p>
                    Separate dashboards for students and teachers with tailored
                    features for each learning role.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Student Dashboard
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Teacher Tools
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="enhanced-feature-card h-100">
                <div className="feature-image">
                  <div className="feature-icon-large">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="feature-bg-pattern"></div>
                </div>
                <div className="feature-content">
                  <h4>Secure & Reliable</h4>
                  <p>
                    JWT-based authentication and secure data storage ensure your
                    learning data is always protected.
                  </p>
                  <div className="feature-benefits">
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      JWT Security
                    </span>
                    <span className="benefit-tag">
                      <i className="bi bi-check-circle-fill"></i>
                      Data Protection
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section 
        ref={coursesRef}
        className={`featured-courses-section py-5 bg-light ${coursesAnimated ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center mb-5">
              <h2 className="display-5 fw-bold">Featured Courses</h2>
              <p className="lead text-muted">
                Start your learning journey with our most popular courses
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            {featuredCourses.map((course, index) => (
              <div key={course.id} className="col-lg-4 col-md-6">
                <div className="course-card h-100">
                  <div className="course-image">
                    <div className="course-category">
                      {course.category}
                    </div>
                  </div>
                  <div className="course-content">
                    <h5 className="course-title">{course.title}</h5>
                    <p className="course-description">
                      {course.description}
                    </p>
                    <div className="course-meta">
                      <span className={`difficulty-badge difficulty-${course.difficulty?.toLowerCase()}`}>
                        {course.difficulty}
                      </span>
                      <span className="duration">
                        <i className="bi bi-clock me-1"></i>
                        {course.estimatedDuration || 60} min
                      </span>
                    </div>
                    <Link 
                      to={`/courses/${course.id}`} 
                      className="btn btn-primary w-100 mt-3"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-5">
            <Link to="/courses" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-arrow-right me-2"></i>
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .feature-item i {
          font-size: 1.2rem;
        }

        .floating-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .stats-section .stat-item {
          padding: 2rem;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: var(--dark-color);
          font-weight: 500;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          font-size: 2rem;
        }

        .course-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          height: 200px;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-category {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .course-content {
          padding: 1.5rem;
        }

        .course-title {
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--dark-color);
        }

        .course-description {
          color: #6c757d;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .difficulty-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .difficulty-beginner {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }

        .difficulty-intermediate {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }

        .difficulty-advanced {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
        }

        .duration {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .network-status .alert {
          border: none;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .hero-features {
            justify-content: center;
          }
          
          .hero-actions {
            text-align: center;
          }
          
          .hero-actions .btn {
            width: 100%;
            margin-bottom: 1rem;
          }
          
          .floating-card {
            margin-top: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
