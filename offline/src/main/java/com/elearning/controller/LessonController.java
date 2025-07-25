package com.elearning.controller;

import com.elearning.dto.MessageResponse;
import com.elearning.entity.Lesson;
import com.elearning.entity.User;
import com.elearning.service.LessonService;
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
@RequestMapping("/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable Long courseId) {
        List<Lesson> lessons = lessonService.getLessonsByCourse(courseId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getLessonById(@PathVariable Long id) {
        Optional<Lesson> lesson = lessonService.getLessonById(id);
        if (lesson.isPresent()) {
            return ResponseEntity.ok(lesson.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/course/{courseId}/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> searchLessonsInCourse(@PathVariable Long courseId, @RequestParam String q) {
        List<Lesson> lessons = lessonService.searchLessonsInCourse(courseId, q);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/next/{currentOrder}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> getNextLessons(@PathVariable Long courseId, @PathVariable Integer currentOrder) {
        List<Lesson> lessons = lessonService.getNextLessons(courseId, currentOrder);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/previous/{currentOrder}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> getPreviousLessons(@PathVariable Long courseId, @PathVariable Integer currentOrder) {
        List<Lesson> lessons = lessonService.getPreviousLessons(courseId, currentOrder);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/order/{order}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getLessonByOrder(@PathVariable Long courseId, @PathVariable Integer order) {
        Lesson lesson = lessonService.getLessonByOrder(courseId, order);
        if (lesson != null) {
            return ResponseEntity.ok(lesson);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createLesson(@PathVariable Long courseId, @Valid @RequestBody Lesson lesson, 
                                        Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Lesson createdLesson = lessonService.createLesson(lesson, courseId, user.getId());
            return ResponseEntity.ok(new MessageResponse("Lesson created successfully!", true, createdLesson));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating lesson: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateLesson(@PathVariable Long id, @Valid @RequestBody Lesson lesson, 
                                        Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Lesson updatedLesson = lessonService.updateLesson(id, lesson, user.getId());
            return ResponseEntity.ok(new MessageResponse("Lesson updated successfully!", true, updatedLesson));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating lesson: " + e.getMessage(), false));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteLesson(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            lessonService.deleteLesson(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Lesson deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting lesson: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}/reorder")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> reorderLesson(@PathVariable Long id, @RequestParam Integer newOrder, 
                                         Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Lesson lesson = lessonService.reorderLesson(id, newOrder, user.getId());
            return ResponseEntity.ok(new MessageResponse("Lesson reordered successfully!", true, lesson));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error reordering lesson: " + e.getMessage(), false));
        }
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> getLessonsByType(@PathVariable Lesson.LessonType type) {
        List<Lesson> lessons = lessonService.getLessonsByType(type);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/type/{type}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Lesson>> getLessonsByCourseAndType(@PathVariable Long courseId, 
                                                                @PathVariable Lesson.LessonType type) {
        List<Lesson> lessons = lessonService.getLessonsByCourseAndType(courseId, type);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<Long> getLessonsCountByCourse(@PathVariable Long courseId) {
        long count = lessonService.getLessonsCountByCourse(courseId);
        return ResponseEntity.ok(count);
    }
}
