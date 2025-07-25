package com.elearning.controller;

import com.elearning.dto.MessageResponse;
import com.elearning.dto.QuizSubmissionRequest;
import com.elearning.entity.Quiz;
import com.elearning.entity.QuizResult;
import com.elearning.entity.User;
import com.elearning.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Quiz>> getQuizzesByLesson(@PathVariable Long lessonId) {
        List<Quiz> quizzes = quizService.getQuizzesByLesson(lessonId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        List<Quiz> quizzes = quizService.getQuizzesByCourse(courseId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        Optional<Quiz> quiz = quizService.getQuizById(id);
        if (quiz.isPresent()) {
            return ResponseEntity.ok(quiz.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/lesson/{lessonId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createQuiz(@PathVariable Long lessonId, @Valid @RequestBody Quiz quiz, 
                                      Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Quiz createdQuiz = quizService.createQuiz(quiz, lessonId, user.getId());
            return ResponseEntity.ok(new MessageResponse("Quiz created successfully!", true, createdQuiz));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating quiz: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @Valid @RequestBody Quiz quiz, 
                                      Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Quiz updatedQuiz = quizService.updateQuiz(id, quiz, user.getId());
            return ResponseEntity.ok(new MessageResponse("Quiz updated successfully!", true, updatedQuiz));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating quiz: " + e.getMessage(), false));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            quizService.deleteQuiz(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Quiz deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting quiz: " + e.getMessage(), false));
        }
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitQuiz(@Valid @RequestBody QuizSubmissionRequest submission, 
                                      Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            QuizResult result = quizService.submitQuizAnswer(
                submission.getQuizId(), 
                user.getId(), 
                submission.getUserAnswer(), 
                submission.getTimeTakenSeconds()
            );
            return ResponseEntity.ok(new MessageResponse("Quiz submitted successfully!", true, result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error submitting quiz: " + e.getMessage(), false));
        }
    }

    @GetMapping("/results/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<QuizResult>> getMyQuizResults(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<QuizResult> results = quizService.getQuizResultsByStudent(user.getId());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<QuizResult>> getQuizResultsByCourse(@PathVariable Long courseId) {
        List<QuizResult> results = quizService.getQuizResultsByCourse(courseId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/my/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<QuizResult>> getMyQuizResultsByCourse(@PathVariable Long courseId, 
                                                                   Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<QuizResult> results = quizService.getQuizResultsByStudentAndCourse(user.getId(), courseId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/results/{quizId}/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyQuizResult(@PathVariable Long quizId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<QuizResult> result = quizService.getQuizResultByStudentAndQuiz(user.getId(), quizId);
        if (result.isPresent()) {
            return ResponseEntity.ok(result.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats/my/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyQuizStats(@PathVariable Long courseId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Double averageScore = quizService.getAverageScoreByStudentAndCourse(user.getId(), courseId);
        long correctAnswers = quizService.getCorrectAnswersCount(user.getId(), courseId);
        long totalAnswers = quizService.getTotalAnswersCount(user.getId(), courseId);
        
        final Double avgScore = averageScore;
        final long correctAns = correctAnswers;
        final long totalAns = totalAnswers;

        return ResponseEntity.ok(new MessageResponse("Quiz statistics retrieved successfully!", true,
            new Object() {
                public final Double averageScore = avgScore;
                public final long correctAnswers = correctAns;
                public final long totalAnswers = totalAns;
                public final double accuracy = totalAns > 0 ? (double) correctAns / totalAns * 100 : 0;
            }));
    }

    @GetMapping("/lesson/{lessonId}/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Quiz>> searchQuizzesInLesson(@PathVariable Long lessonId, @RequestParam String q) {
        List<Quiz> quizzes = quizService.searchQuizzesInLesson(lessonId, q);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/course/{courseId}/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Quiz>> searchQuizzesInCourse(@PathVariable Long courseId, @RequestParam String q) {
        List<Quiz> quizzes = quizService.searchQuizzesInCourse(courseId, q);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Quiz>> getQuizzesByType(@PathVariable Quiz.QuizType type) {
        List<Quiz> quizzes = quizService.getQuizzesByType(type);
        return ResponseEntity.ok(quizzes);
    }
}
