package com.elearning.controller;

import com.elearning.dto.MessageResponse;
import com.elearning.entity.Course;
import com.elearning.entity.User;
import com.elearning.service.CourseService;
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
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // Public endpoints (no authentication required)
    @GetMapping("/public/all")
    public ResponseEntity<List<Course>> getAllPublishedCourses() {
        List<Course> courses = courseService.getAllPublishedCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublishedCourseById(@PathVariable Long id) {
        Optional<Course> course = courseService.getCourseById(id);
        if (course.isPresent() && course.get().getIsPublished()) {
            return ResponseEntity.ok(course.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String q) {
        List<Course> courses = courseService.searchCourses(q);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/public/filter")
    public ResponseEntity<List<Course>> filterCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        List<Course> courses = courseService.filterCourses(search, category, difficulty);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = courseService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/public/difficulties")
    public ResponseEntity<List<String>> getAllDifficulties() {
        List<String> difficulties = courseService.getAllDifficulties();
        return ResponseEntity.ok(difficulties);
    }

    // Protected endpoints (authentication required)
    @GetMapping("/all")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseService.getCourseById(id);
        if (course.isPresent()) {
            return ResponseEntity.ok(course.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Course>> getMyCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Course> courses = courseService.getCoursesByTeacher(user.getId());
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createCourse(@Valid @RequestBody Course course, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Course createdCourse = courseService.createCourse(course, user.getId());
            return ResponseEntity.ok(new MessageResponse("Course created successfully!", true, createdCourse));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating course: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody Course course, 
                                        Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Course updatedCourse = courseService.updateCourse(id, course, user.getId());
            return ResponseEntity.ok(new MessageResponse("Course updated successfully!", true, updatedCourse));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating course: " + e.getMessage(), false));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            courseService.deleteCourse(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Course deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting course: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> publishCourse(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Course course = courseService.publishCourse(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Course published successfully!", true, course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error publishing course: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> unpublishCourse(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Course course = courseService.unpublishCourse(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Course unpublished successfully!", true, course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error unpublishing course: " + e.getMessage(), false));
        }
    }
}
