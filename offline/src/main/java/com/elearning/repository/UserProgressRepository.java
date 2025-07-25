package com.elearning.repository;

import com.elearning.entity.UserProgress;
import com.elearning.entity.User;
import com.elearning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    
    List<UserProgress> findByStudent(User student);
    
    List<UserProgress> findByStudent_Id(Long studentId);

    List<UserProgress> findByCourse(Course course);

    List<UserProgress> findByCourse_Id(Long courseId);

    Optional<UserProgress> findByStudentAndCourse(User student, Course course);

    Optional<UserProgress> findByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    List<UserProgress> findByStudent_IdAndIsCompletedTrue(Long studentId);

    List<UserProgress> findByStudent_IdAndIsCompletedFalse(Long studentId);

    List<UserProgress> findByCourse_IdAndIsCompletedTrue(Long courseId);

    List<UserProgress> findByCourse_IdAndIsCompletedFalse(Long courseId);
    
    @Query("SELECT up FROM UserProgress up WHERE up.student.id = :studentId ORDER BY up.lastUpdated DESC")
    List<UserProgress> findByStudentIdOrderByLastUpdatedDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT up FROM UserProgress up WHERE up.course.id = :courseId ORDER BY up.completionPercentage DESC")
    List<UserProgress> findByCourseIdOrderByCompletionPercentageDesc(@Param("courseId") Long courseId);
    
    @Query("SELECT AVG(up.completionPercentage) FROM UserProgress up WHERE up.student.id = :studentId")
    Double findAverageCompletionPercentageByStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT AVG(up.completionPercentage) FROM UserProgress up WHERE up.course.id = :courseId")
    Double findAverageCompletionPercentageByCourse(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.student.id = :studentId AND up.isCompleted = true")
    long countCompletedCoursesByStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.course.id = :courseId AND up.isCompleted = true")
    long countCompletedStudentsByCourse(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.student.id = :studentId")
    long countEnrolledCoursesByStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.course.id = :courseId")
    long countEnrolledStudentsByCourse(@Param("courseId") Long courseId);
    
    @Query("SELECT up FROM UserProgress up WHERE up.completionPercentage >= :minPercentage ORDER BY up.completionPercentage DESC")
    List<UserProgress> findByCompletionPercentageGreaterThanEqual(@Param("minPercentage") Double minPercentage);
}
