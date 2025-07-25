import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNetwork } from '../../hooks/useNetwork';
import { useOffline } from '../../contexts/OfflineContext';
import { useScrollAnimation } from '../../hooks/useIntersectionObserver';
import { coursesAPI, offlineAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  const { isOnline, getConnectionQuality, canLoadImages } = useNetwork();
  const { getCachedData, cacheData, preloadContent } = useOffline();
  const { targetRef, hasAnimated } = useScrollAnimation();

  useEffect(() => {
    loadCourses();
    loadFilters();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedDifficulty]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      
      const result = await offlineAPI.request(
        () => coursesAPI.getPublicCourses(),
        [], // fallback data
        'courses-public' // cache key
      );
      
      setCourses(result.data);
      
      // Cache courses for offline use if online
      if (isOnline && !result.fromCache) {
        await cacheData('courses', result.data);
      }
      
    } catch (error) {
      console.error('Failed to load courses:', error);
      
      // Try to load from IndexedDB cache
      try {
        const cachedCourses = await getCachedData('courses');
        if (cachedCourses) {
          setCourses(Array.isArray(cachedCourses) ? cachedCourses : []);
        }
      } catch (cacheError) {
        console.error('Failed to load cached courses:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      // Load categories
      const categoriesResult = await offlineAPI.request(
        () => coursesAPI.getCategories(),
        ['Programming', 'Design', 'Data Science'], // fallback
        'categories'
      );
      setCategories(categoriesResult.data);

      // Load difficulties
      const difficultiesResult = await offlineAPI.request(
        () => coursesAPI.getDifficulties(),
        ['Beginner', 'Intermediate', 'Advanced'], // fallback
        'difficulties'
      );
      setDifficulties(difficultiesResult.data);

    } catch (error) {
      console.error('Failed to load filters:', error);
      // Set default filters
      setCategories(['Programming', 'Design', 'Data Science']);
      setDifficulties(['Beginner', 'Intermediate', 'Advanced']);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  };

  const handleCourseHover = (courseId) => {
    // Preload course content on hover for better UX
    if (isOnline) {
      preloadContent(courseId);
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

  if (loading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <div className="courses-page">
      <div className="container py-4">
        {/* Header */}
        <div className="courses-header mb-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">Explore Courses</h1>
              <p className="lead text-muted">
                Discover our comprehensive collection of courses designed for all skill levels
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className={`network-indicator ${isOnline ? 'online' : 'offline'}`}>
                <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
                {isOnline ? (
                  <span>Online ({getConnectionQuality()})</span>
                ) : (
                  <span>Offline Mode</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section mb-4">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="search" className="form-label">
                    <i className="bi bi-search me-2"></i>
                    Search Courses
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="col-md-4">
                  <label htmlFor="category" className="form-label">
                    <i className="bi bi-tag me-2"></i>
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label htmlFor="difficulty" className="form-label">
                    <i className="bi bi-bar-chart me-2"></i>
                    Difficulty
                  </label>
                  <select
                    className="form-select"
                    id="difficulty"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {(searchTerm || selectedCategory || selectedDifficulty) && (
                <div className="mt-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSelectedDifficulty('');
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Filters
                  </button>
                  <span className="ms-3 text-muted">
                    Showing {filteredCourses.length} of {courses.length} courses
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div 
          ref={targetRef}
          className={`courses-grid ${hasAnimated ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          {filteredCourses.length > 0 ? (
            <div className="row g-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="col-lg-4 col-md-6">
                  <div 
                    className="course-card h-100"
                    onMouseEnter={() => handleCourseHover(course.id)}
                  >
                    <div className="course-image">
                      {canLoadImages() && course.thumbnailUrl ? (
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="course-placeholder">
                          <i className="bi bi-book display-4"></i>
                        </div>
                      )}
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
                        <span className={`badge bg-${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className="duration">
                          <i className="bi bi-clock me-1"></i>
                          {course.estimatedDuration || 60} min
                        </span>
                      </div>
                      
                      <div className="course-teacher">
                        <i className="bi bi-person me-2"></i>
                        <span>{course.teacherName || 'Instructor'}</span>
                      </div>
                      
                      <Link 
                        to={`/courses/${course.id}`}
                        className="btn btn-primary w-100 mt-3"
                      >
                        <i className="bi bi-play-circle me-2"></i>
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-3"></i>
              <h4>No courses found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory || selectedDifficulty
                  ? 'Try adjusting your filters to find more courses'
                  : 'No courses are available at the moment'
                }
              </p>
              {(searchTerm || selectedCategory || selectedDifficulty) && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedDifficulty('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="alert alert-info mt-4">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Offline Mode:</strong> You're viewing cached courses. 
            Some content may be limited until you're back online.
          </div>
        )}
      </div>

      <style jsx>{`
        .courses-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
        }

        .network-indicator {
          padding: 0.75rem 1.25rem;
          border-radius: 25px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .network-indicator.online {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
          border: 2px solid rgba(40, 167, 69, 0.2);
        }

        .network-indicator.offline {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
          border: 2px solid rgba(220, 53, 69, 0.2);
        }

        .filters-section .card {
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 15px;
        }

        .course-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          height: 200px;
          position: relative;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        }

        .course-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .course-category {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          color: var(--dark-color);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .course-content {
          padding: 1.5rem;
        }

        .course-title {
          font-weight: 700;
          color: var(--dark-color);
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .course-description {
          color: #6c757d;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .duration {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .course-teacher {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }

        .no-courses {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .courses-header {
            text-align: center;
            padding: 2rem 1rem;
          }
          
          .network-indicator {
            margin-top: 1rem;
            display: inline-block;
          }
          
          .filters-section .row > div {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Courses;
