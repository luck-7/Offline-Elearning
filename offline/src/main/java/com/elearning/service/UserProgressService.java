package com.elearning.service;

import com.elearning.entity.UserProgress;
import com.elearning.entity.User;
import com.elearning.entity.Course;
import com.elearning.entity.Lesson;
import com.elearning.repository.UserProgressRepository;
import com.elearning.repository.UserRepository;
import com.elearning.repository.CourseRepository;
import com.elearning.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserProgressService {

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    public UserProgress getOrCreateProgress(Long studentId, Long courseId) {
        Optional<UserProgress> existingProgress = userProgressRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
        
        if (existingProgress.isPresent()) {
            return existingProgress.get();
        }

        // Create new progress record
        Optional<User> student = userRepository.findById(studentId);
        Optional<Course> course = courseRepository.findById(courseId);

        if (student.isPresent() && course.isPresent()) {
            UserProgress progress = new UserProgress(student.get(), course.get());
            
            // Set total lessons count
            long totalLessons = lessonRepository.countByCourseId(courseId);
            progress.setTotalLessons((int) totalLessons);
            
            return userProgressRepository.save(progress);
        }
        
        throw new RuntimeException("Student or course not found");
    }

    public UserProgress updateLessonProgress(Long studentId, Long courseId, Long lessonId, 
                                           Integer timeSpentMinutes, Boolean completed) {
        UserProgress progress = getOrCreateProgress(studentId, courseId);
        
        // Update time spent
        if (timeSpentMinutes != null) {
            progress.setTotalTimeSpent(progress.getTotalTimeSpent() + timeSpentMinutes);
        }
        
        // Update last accessed lesson
        progress.setLastAccessedLessonId(lessonId);
        
        // If lesson is completed, increment completed lessons count
        if (completed != null && completed) {
            // Check if this lesson was already completed to avoid double counting
            // This is a simplified approach - in a real app, you might track individual lesson completions
            progress.setLessonsCompleted(progress.getLessonsCompleted() + 1);
        }
        
        // Update completion percentage and check if course is completed
        updateCompletionStatus(progress);
        
        return userProgressRepository.save(progress);
    }

    private void updateCompletionStatus(UserProgress progress) {
        if (progress.getTotalLessons() > 0) {
            double percentage = (progress.getLessonsCompleted().doubleValue() / progress.getTotalLessons().doubleValue()) * 100.0;
            progress.setCompletionPercentage(percentage);
            
            if (progress.getLessonsCompleted().equals(progress.getTotalLessons())) {
                progress.setIsCompleted(true);
            }
        }
    }

    public List<UserProgress> getProgressByStudent(Long studentId) {
        return userProgressRepository.findByStudentIdOrderByLastUpdatedDesc(studentId);
    }

    public List<UserProgress> getProgressByCourse(Long courseId) {
        return userProgressRepository.findByCourseIdOrderByCompletionPercentageDesc(courseId);
    }

    public Optional<UserProgress> getProgressByStudentAndCourse(Long studentId, Long courseId) {
        return userProgressRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
    }

    public List<UserProgress> getCompletedCoursesByStudent(Long studentId) {
        return userProgressRepository.findByStudent_IdAndIsCompletedTrue(studentId);
    }

    public List<UserProgress> getInProgressCoursesByStudent(Long studentId) {
        return userProgressRepository.findByStudent_IdAndIsCompletedFalse(studentId);
    }

    public Double getAverageCompletionByStudent(Long studentId) {
        return userProgressRepository.findAverageCompletionPercentageByStudent(studentId);
    }

    public Double getAverageCompletionByCourse(Long courseId) {
        return userProgressRepository.findAverageCompletionPercentageByCourse(courseId);
    }

    public long getCompletedCoursesCount(Long studentId) {
        return userProgressRepository.countCompletedCoursesByStudent(studentId);
    }

    public long getEnrolledCoursesCount(Long studentId) {
        return userProgressRepository.countEnrolledCoursesByStudent(studentId);
    }

    public long getCompletedStudentsCount(Long courseId) {
        return userProgressRepository.countCompletedStudentsByCourse(courseId);
    }

    public long getEnrolledStudentsCount(Long courseId) {
        return userProgressRepository.countEnrolledStudentsByCourse(courseId);
    }

    public UserProgress enrollInCourse(Long studentId, Long courseId) {
        // Check if already enrolled
        Optional<UserProgress> existingProgress = userProgressRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
        if (existingProgress.isPresent()) {
            return existingProgress.get();
        }

        return getOrCreateProgress(studentId, courseId);
    }

    public void unenrollFromCourse(Long studentId, Long courseId) {
        Optional<UserProgress> progress = userProgressRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
        if (progress.isPresent()) {
            userProgressRepository.delete(progress.get());
        }
    }

    public UserProgress resetProgress(Long studentId, Long courseId) {
        Optional<UserProgress> progressOpt = userProgressRepository.findByStudent_IdAndCourse_Id(studentId, courseId);
        if (progressOpt.isPresent()) {
            UserProgress progress = progressOpt.get();
            progress.setLessonsCompleted(0);
            progress.setQuizScore(0.0);
            progress.setTotalTimeSpent(0);
            progress.setCompletionPercentage(0.0);
            progress.setIsCompleted(false);
            progress.setLastAccessedLessonId(null);
            progress.setCompletedAt(null);
            
            return userProgressRepository.save(progress);
        }
        throw new RuntimeException("Progress record not found");
    }

    public List<UserProgress> getHighPerformers(Double minPercentage) {
        return userProgressRepository.findByCompletionPercentageGreaterThanEqual(minPercentage);
    }

    public UserProgress updateQuizScore(Long studentId, Long courseId, Double newScore) {
        UserProgress progress = getOrCreateProgress(studentId, courseId);
        progress.setQuizScore(newScore);
        return userProgressRepository.save(progress);
    }
}
