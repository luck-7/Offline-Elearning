package com.elearning.repository;

import com.elearning.entity.Course;
import com.elearning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByIsPublishedTrue();
    
    List<Course> findByTeacher(User teacher);
    
    List<Course> findByTeacher_Id(Long teacherId);
    
    List<Course> findByCategory(String category);
    
    List<Course> findByCategoryAndIsPublishedTrue(String category);
    
    List<Course> findByDifficulty(String difficulty);
    
    List<Course> findByDifficultyAndIsPublishedTrue(String difficulty);
    
    @Query("SELECT c FROM Course c WHERE c.isPublished = true ORDER BY c.createdAt DESC")
    List<Course> findPublishedCoursesOrderByCreatedAtDesc();
    
    @Query("SELECT c FROM Course c WHERE c.teacher.id = :teacherId ORDER BY c.createdAt DESC")
    List<Course> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") Long teacherId);
    
    @Query("SELECT DISTINCT c.category FROM Course c WHERE c.isPublished = true ORDER BY c.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT c.difficulty FROM Course c WHERE c.isPublished = true ORDER BY c.difficulty")
    List<String> findDistinctDifficulties();
    
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Course> searchPublishedCourses(@Param("search") String search);
    
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:difficulty IS NULL OR c.difficulty = :difficulty) AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Course> filterCourses(@Param("search") String search, 
                              @Param("category") String category, 
                              @Param("difficulty") String difficulty);
    
    @Query("SELECT COUNT(c) FROM Course c WHERE c.isPublished = true")
    long countPublishedCourses();
    
    @Query("SELECT COUNT(c) FROM Course c WHERE c.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") Long teacherId);
}
