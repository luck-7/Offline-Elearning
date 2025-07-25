package com.elearning.service;

import com.elearning.entity.Lesson;
import com.elearning.entity.Course;
import com.elearning.repository.LessonRepository;
import com.elearning.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Lesson> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
    }

    public Optional<Lesson> getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId);
    }

    public List<Lesson> searchLessonsInCourse(Long courseId, String searchTerm) {
        return lessonRepository.searchLessonsInCourse(courseId, searchTerm);
    }

    public Lesson createLesson(Lesson lesson, Long courseId, Long teacherId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            
            // Check if the teacher owns this course
            if (!course.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to create lesson in this course");
            }

            lesson.setCourse(course);
            
            // Set lesson order if not provided
            if (lesson.getLessonOrder() == null) {
                Integer maxOrder = lessonRepository.findMaxLessonOrderByCourseId(courseId);
                lesson.setLessonOrder(maxOrder != null ? maxOrder + 1 : 1);
            }

            return lessonRepository.save(lesson);
        }
        throw new RuntimeException("Course not found");
    }

    public Lesson updateLesson(Long lessonId, Lesson updatedLesson, Long teacherId) {
        Optional<Lesson> existingLesson = lessonRepository.findById(lessonId);
        if (existingLesson.isPresent()) {
            Lesson lesson = existingLesson.get();
            
            // Check if the teacher owns the course this lesson belongs to
            if (!lesson.getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to update this lesson");
            }

            lesson.setTitle(updatedLesson.getTitle());
            lesson.setContent(updatedLesson.getContent());
            lesson.setType(updatedLesson.getType());
            lesson.setDurationMinutes(updatedLesson.getDurationMinutes());
            lesson.setVideoUrl(updatedLesson.getVideoUrl());
            lesson.setImageUrl(updatedLesson.getImageUrl());
            lesson.setResources(updatedLesson.getResources());
            
            if (updatedLesson.getLessonOrder() != null) {
                lesson.setLessonOrder(updatedLesson.getLessonOrder());
            }

            return lessonRepository.save(lesson);
        }
        throw new RuntimeException("Lesson not found");
    }

    public void deleteLesson(Long lessonId, Long teacherId) {
        Optional<Lesson> lesson = lessonRepository.findById(lessonId);
        if (lesson.isPresent()) {
            // Check if the teacher owns the course this lesson belongs to
            if (!lesson.get().getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to delete this lesson");
            }
            lessonRepository.deleteById(lessonId);
        } else {
            throw new RuntimeException("Lesson not found");
        }
    }

    public List<Lesson> getNextLessons(Long courseId, Integer currentOrder) {
        return lessonRepository.findNextLessons(courseId, currentOrder);
    }

    public List<Lesson> getPreviousLessons(Long courseId, Integer currentOrder) {
        return lessonRepository.findPreviousLessons(courseId, currentOrder);
    }

    public Lesson getLessonByOrder(Long courseId, Integer order) {
        return lessonRepository.findByCourseIdAndLessonOrder(courseId, order);
    }

    public long getLessonsCountByCourse(Long courseId) {
        return lessonRepository.countByCourseId(courseId);
    }

    public List<Lesson> getLessonsByType(Lesson.LessonType type) {
        return lessonRepository.findByType(type);
    }

    public List<Lesson> getLessonsByCourseAndType(Long courseId, Lesson.LessonType type) {
        return lessonRepository.findByCourse_IdAndType(courseId, type);
    }

    public Lesson reorderLesson(Long lessonId, Integer newOrder, Long teacherId) {
        Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);
        if (lessonOpt.isPresent()) {
            Lesson lesson = lessonOpt.get();
            
            // Check if the teacher owns the course this lesson belongs to
            if (!lesson.getCourse().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to reorder this lesson");
            }

            lesson.setLessonOrder(newOrder);
            return lessonRepository.save(lesson);
        }
        throw new RuntimeException("Lesson not found");
    }
}
