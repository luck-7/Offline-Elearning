package com.elearning.service;

import com.elearning.entity.Quiz;
import com.elearning.entity.QuizResult;
import com.elearning.entity.Lesson;
import com.elearning.entity.User;
import com.elearning.repository.QuizRepository;
import com.elearning.repository.QuizResultRepository;
import com.elearning.repository.LessonRepository;
import com.elearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Quiz> getQuizzesByLesson(Long lessonId) {
        return quizRepository.findByLesson_Id(lessonId);
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Optional<Quiz> getQuizById(Long quizId) {
        return quizRepository.findById(quizId);
    }

    public Quiz createQuiz(Quiz quiz, Long lessonId, Long teacherId) {
        Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);
        if (lessonOpt.isPresent()) {
            Lesson lesson = lessonOpt.get();
            
            // Check if the teacher owns the course this lesson belongs to
            if (!lesson.getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to create quiz in this lesson");
            }

            quiz.setLesson(lesson);
            return quizRepository.save(quiz);
        }
        throw new RuntimeException("Lesson not found");
    }

    public Quiz updateQuiz(Long quizId, Quiz updatedQuiz, Long teacherId) {
        Optional<Quiz> existingQuiz = quizRepository.findById(quizId);
        if (existingQuiz.isPresent()) {
            Quiz quiz = existingQuiz.get();
            
            // Check if the teacher owns the course this quiz belongs to
            if (!quiz.getLesson().getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to update this quiz");
            }

            quiz.setTitle(updatedQuiz.getTitle());
            quiz.setQuestion(updatedQuiz.getQuestion());
            quiz.setType(updatedQuiz.getType());
            quiz.setOptions(updatedQuiz.getOptions());
            quiz.setCorrectAnswer(updatedQuiz.getCorrectAnswer());
            quiz.setExplanation(updatedQuiz.getExplanation());
            quiz.setPoints(updatedQuiz.getPoints());
            quiz.setTimeLimitSeconds(updatedQuiz.getTimeLimitSeconds());

            return quizRepository.save(quiz);
        }
        throw new RuntimeException("Quiz not found");
    }

    public void deleteQuiz(Long quizId, Long teacherId) {
        Optional<Quiz> quiz = quizRepository.findById(quizId);
        if (quiz.isPresent()) {
            // Check if the teacher owns the course this quiz belongs to
            if (!quiz.get().getLesson().getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to delete this quiz");
            }
            quizRepository.deleteById(quizId);
        } else {
            throw new RuntimeException("Quiz not found");
        }
    }

    public QuizResult submitQuizAnswer(Long quizId, Long studentId, String userAnswer, Integer timeTakenSeconds) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        Optional<User> studentOpt = userRepository.findById(studentId);

        if (quizOpt.isPresent() && studentOpt.isPresent()) {
            Quiz quiz = quizOpt.get();
            User student = studentOpt.get();

            // Check if student has already submitted this quiz
            Optional<QuizResult> existingResult = quizResultRepository.findByStudent_IdAndQuiz_Id(studentId, quizId);
            if (existingResult.isPresent()) {
                throw new RuntimeException("Quiz already submitted");
            }

            // Evaluate the answer
            boolean isCorrect = evaluateAnswer(quiz, userAnswer);
            int pointsEarned = isCorrect ? quiz.getPoints() : 0;

            QuizResult result = new QuizResult(student, quiz, userAnswer, isCorrect, pointsEarned);
            result.setTimeTakenSeconds(timeTakenSeconds);

            return quizResultRepository.save(result);
        }
        throw new RuntimeException("Quiz or student not found");
    }

    private boolean evaluateAnswer(Quiz quiz, String userAnswer) {
        if (quiz.getCorrectAnswer() == null || userAnswer == null) {
            return false;
        }

        switch (quiz.getType()) {
            case MULTIPLE_CHOICE:
            case TRUE_FALSE:
            case FILL_BLANK:
                return quiz.getCorrectAnswer().trim().equalsIgnoreCase(userAnswer.trim());
            case DRAWING:
                // For drawing quizzes, we might need more sophisticated comparison
                // For now, we'll do a simple string comparison
                return quiz.getCorrectAnswer().equals(userAnswer);
            case MATCHING:
                // For matching quizzes, compare JSON strings or implement custom logic
                return quiz.getCorrectAnswer().equals(userAnswer);
            default:
                return false;
        }
    }

    public List<QuizResult> getQuizResultsByStudent(Long studentId) {
        return quizResultRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    public List<QuizResult> getQuizResultsByCourse(Long courseId) {
        return quizResultRepository.findByCourseIdOrderBySubmittedAtDesc(courseId);
    }

    public List<QuizResult> getQuizResultsByStudentAndCourse(Long studentId, Long courseId) {
        return quizResultRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public Optional<QuizResult> getQuizResultByStudentAndQuiz(Long studentId, Long quizId) {
        return quizResultRepository.findByStudent_IdAndQuiz_Id(studentId, quizId);
    }

    public Double getAverageScoreByStudentAndCourse(Long studentId, Long courseId) {
        return quizResultRepository.findAverageScoreByStudentAndCourse(studentId, courseId);
    }

    public long getCorrectAnswersCount(Long studentId, Long courseId) {
        return quizResultRepository.countCorrectAnswersByStudentAndCourse(studentId, courseId);
    }

    public long getTotalAnswersCount(Long studentId, Long courseId) {
        return quizResultRepository.countTotalAnswersByStudentAndCourse(studentId, courseId);
    }

    public List<Quiz> searchQuizzesInLesson(Long lessonId, String searchTerm) {
        return quizRepository.searchQuizzesInLesson(lessonId, searchTerm);
    }

    public List<Quiz> searchQuizzesInCourse(Long courseId, String searchTerm) {
        return quizRepository.searchQuizzesInCourse(courseId, searchTerm);
    }

    public long getQuizzesCountByLesson(Long lessonId) {
        return quizRepository.countByLessonId(lessonId);
    }

    public long getQuizzesCountByCourse(Long courseId) {
        return quizRepository.countByCourseId(courseId);
    }

    public List<Quiz> getQuizzesByType(Quiz.QuizType type) {
        return quizRepository.findByType(type);
    }

    public List<Quiz> getQuizzesByCourseAndType(Long courseId, Quiz.QuizType type) {
        return quizRepository.findByCourseIdAndType(courseId, type);
    }
}
