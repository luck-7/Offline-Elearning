package com.elearning.repository;

import com.elearning.entity.Quiz;
import com.elearning.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByLesson(Lesson lesson);
    
    List<Quiz> findByLesson_Id(Long lessonId);

    List<Quiz> findByType(Quiz.QuizType type);

    List<Quiz> findByLesson_IdAndType(Long lessonId, Quiz.QuizType type);
    
    @Query("SELECT q FROM Quiz q WHERE q.lesson.course.id = :courseId")
    List<Quiz> findByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT q FROM Quiz q WHERE q.lesson.course.id = :courseId AND q.type = :type")
    List<Quiz> findByCourseIdAndType(@Param("courseId") Long courseId, @Param("type") Quiz.QuizType type);
    
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.lesson.id = :lessonId")
    long countByLessonId(@Param("lessonId") Long lessonId);
    
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.lesson.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT q FROM Quiz q WHERE q.lesson.id = :lessonId AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.question) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Quiz> searchQuizzesInLesson(@Param("lessonId") Long lessonId, @Param("search") String search);
    
    @Query("SELECT q FROM Quiz q WHERE q.lesson.course.id = :courseId AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.question) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Quiz> searchQuizzesInCourse(@Param("courseId") Long courseId, @Param("search") String search);
}
