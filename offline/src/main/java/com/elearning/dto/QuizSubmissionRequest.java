package com.elearning.dto;

import jakarta.validation.constraints.NotNull;

public class QuizSubmissionRequest {
    
    @NotNull
    private Long quizId;
    
    @NotNull
    private String userAnswer;
    
    private Integer timeTakenSeconds;

    public QuizSubmissionRequest() {}

    public QuizSubmissionRequest(Long quizId, String userAnswer, Integer timeTakenSeconds) {
        this.quizId = quizId;
        this.userAnswer = userAnswer;
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
}
