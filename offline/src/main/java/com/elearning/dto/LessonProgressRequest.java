package com.elearning.dto;

import jakarta.validation.constraints.NotNull;

public class LessonProgressRequest {
    
    @NotNull
    private Long lessonId;
    
    @NotNull
    private Long courseId;
    
    private Integer timeSpentMinutes;
    
    private Boolean completed;

    public LessonProgressRequest() {}

    public LessonProgressRequest(Long lessonId, Long courseId, Integer timeSpentMinutes, Boolean completed) {
        this.lessonId = lessonId;
        this.courseId = courseId;
        this.timeSpentMinutes = timeSpentMinutes;
        this.completed = completed;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Integer getTimeSpentMinutes() {
        return timeSpentMinutes;
    }

    public void setTimeSpentMinutes(Integer timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
