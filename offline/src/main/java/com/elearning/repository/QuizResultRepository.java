package com.elearning.repository;

import com.elearning.entity.QuizResult;
import com.elearning.entity.User;
import com.elearning.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    
    List<QuizResult> findByStudent(User student);
    
    List<QuizResult> findByStudent_Id(Long studentId);

    List<QuizResult> findByQuiz(Quiz quiz);

    List<QuizResult> findByQuiz_Id(Long quizId);

    Optional<QuizResult> findByStudentAndQuiz(User student, Quiz quiz);

    Optional<QuizResult> findByStudent_IdAndQuiz_Id(Long studentId, Long quizId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quiz.lesson.course.id = :courseId AND qr.student.id = :studentId")
    List<QuizResult> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quiz.lesson.id = :lessonId AND qr.student.id = :studentId")
    List<QuizResult> findByStudentIdAndLessonId(@Param("studentId") Long studentId, @Param("lessonId") Long lessonId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quiz.lesson.course.id = :courseId")
    List<QuizResult> findByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quiz.lesson.id = :lessonId")
    List<QuizResult> findByLessonId(@Param("lessonId") Long lessonId);
    
    @Query("SELECT AVG(qr.pointsEarned) FROM QuizResult qr WHERE qr.student.id = :studentId AND qr.quiz.lesson.course.id = :courseId")
    Double findAverageScoreByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.student.id = :studentId AND qr.quiz.lesson.course.id = :courseId AND qr.isCorrect = true")
    long countCorrectAnswersByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.student.id = :studentId AND qr.quiz.lesson.course.id = :courseId")
    long countTotalAnswersByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.student.id = :studentId ORDER BY qr.submittedAt DESC")
    List<QuizResult> findByStudentIdOrderBySubmittedAtDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quiz.lesson.course.id = :courseId ORDER BY qr.submittedAt DESC")
    List<QuizResult> findByCourseIdOrderBySubmittedAtDesc(@Param("courseId") Long courseId);
}
