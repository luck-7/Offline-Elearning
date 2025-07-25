package com.elearning.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(name = "lessons_completed")
    private Integer lessonsCompleted = 0;

    @Column(name = "total_lessons")
    private Integer totalLessons = 0;

    @Column(name = "quiz_score")
    private Double quizScore = 0.0;

    @Column(name = "total_time_spent")
    private Integer totalTimeSpent = 0; // in minutes

    @Column(name = "completion_percentage")
    private Double completionPercentage = 0.0;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "last_accessed_lesson_id")
    private Long lastAccessedLessonId;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Constructors
    public UserProgress() {
        this.startedAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.lessonsCompleted = 0;
        this.totalLessons = 0;
        this.quizScore = 0.0;
        this.totalTimeSpent = 0;
        this.completionPercentage = 0.0;
        this.isCompleted = false;
    }

    public UserProgress(User student, Course course) {
        this();
        this.student = student;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Integer getLessonsCompleted() { return lessonsCompleted; }
    public void setLessonsCompleted(Integer lessonsCompleted) { 
        this.lessonsCompleted = lessonsCompleted;
        updateCompletionPercentage();
    }

    public Integer getTotalLessons() { return totalLessons; }
    public void setTotalLessons(Integer totalLessons) { 
        this.totalLessons = totalLessons;
        updateCompletionPercentage();
    }

    public Double getQuizScore() { return quizScore; }
    public void setQuizScore(Double quizScore) { this.quizScore = quizScore; }

    public Integer getTotalTimeSpent() { return totalTimeSpent; }
    public void setTotalTimeSpent(Integer totalTimeSpent) { this.totalTimeSpent = totalTimeSpent; }

    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { 
        this.isCompleted = isCompleted;
        if (isCompleted && completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    public Long getLastAccessedLessonId() { return lastAccessedLessonId; }
    public void setLastAccessedLessonId(Long lastAccessedLessonId) { this.lastAccessedLessonId = lastAccessedLessonId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Helper methods
    private void updateCompletionPercentage() {
        if (totalLessons != null && totalLessons > 0 && lessonsCompleted != null) {
            this.completionPercentage = (lessonsCompleted.doubleValue() / totalLessons.doubleValue()) * 100.0;
            this.isCompleted = lessonsCompleted.equals(totalLessons);
        }
    }

    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    public String getStudentName() {
        return student != null ? student.getFirstName() + " " + student.getLastName() : null;
    }

    public Long getCourseId() {
        return course != null ? course.getId() : null;
    }

    public String getCourseTitle() {
        return course != null ? course.getTitle() : null;
    }
}
