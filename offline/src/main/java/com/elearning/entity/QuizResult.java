package com.elearning.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_earned")
    private Integer pointsEarned;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    // Constructors
    public QuizResult() {
        this.submittedAt = LocalDateTime.now();
    }

    public QuizResult(User student, Quiz quiz, String userAnswer, Boolean isCorrect, Integer pointsEarned) {
        this();
        this.student = student;
        this.quiz = quiz;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect;
        this.pointsEarned = pointsEarned;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }

    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }

    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }

    public Integer getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(Integer timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    // Helper methods
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    public String getStudentName() {
        return student != null ? student.getFirstName() + " " + student.getLastName() : null;
    }

    public Long getQuizId() {
        return quiz != null ? quiz.getId() : null;
    }

    public String getQuizTitle() {
        return quiz != null ? quiz.getTitle() : null;
    }

    public Long getLessonId() {
        return quiz != null ? quiz.getLessonId() : null;
    }

    public Long getCourseId() {
        return quiz != null ? quiz.getCourseId() : null;
    }
}
