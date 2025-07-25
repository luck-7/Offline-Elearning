package com.elearning.repository;

import com.elearning.entity.Lesson;
import com.elearning.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    
    List<Lesson> findByCourse(Course course);
    
    List<Lesson> findByCourse_Id(Long courseId);

    List<Lesson> findByCourse_IdOrderByLessonOrder(Long courseId);

    List<Lesson> findByType(Lesson.LessonType type);

    List<Lesson> findByCourse_IdAndType(Long courseId, Lesson.LessonType type);
    
    @Query("SELECT l FROM Lesson l WHERE l.course.id = :courseId ORDER BY l.lessonOrder ASC")
    List<Lesson> findByCourseIdOrderByLessonOrderAsc(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT l FROM Lesson l WHERE l.course.id = :courseId AND l.lessonOrder = :order")
    Lesson findByCourseIdAndLessonOrder(@Param("courseId") Long courseId, @Param("order") Integer order);
    
    @Query("SELECT l FROM Lesson l WHERE l.course.id = :courseId AND l.lessonOrder > :currentOrder ORDER BY l.lessonOrder ASC")
    List<Lesson> findNextLessons(@Param("courseId") Long courseId, @Param("currentOrder") Integer currentOrder);
    
    @Query("SELECT l FROM Lesson l WHERE l.course.id = :courseId AND l.lessonOrder < :currentOrder ORDER BY l.lessonOrder DESC")
    List<Lesson> findPreviousLessons(@Param("courseId") Long courseId, @Param("currentOrder") Integer currentOrder);
    
    @Query("SELECT MAX(l.lessonOrder) FROM Lesson l WHERE l.course.id = :courseId")
    Integer findMaxLessonOrderByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT l FROM Lesson l WHERE l.course.id = :courseId AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Lesson> searchLessonsInCourse(@Param("courseId") Long courseId, @Param("search") String search);
}
