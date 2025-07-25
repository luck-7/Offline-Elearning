package com.elearning.controller;

import com.elearning.dto.LessonProgressRequest;
import com.elearning.dto.MessageResponse;
import com.elearning.entity.User;
import com.elearning.entity.UserProgress;
import com.elearning.service.UserProgressService;
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
@RequestMapping("/user/progress")
public class UserProgressController {

    @Autowired
    private UserProgressService userProgressService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgress>> getMyProgress(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<UserProgress> progress = userProgressService.getProgressByStudent(user.getId());
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/my/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyProgressForCourse(@PathVariable Long courseId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<UserProgress> progress = userProgressService.getProgressByStudentAndCourse(user.getId(), courseId);
        if (progress.isPresent()) {
            return ResponseEntity.ok(progress.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/my/completed")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgress>> getMyCompletedCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<UserProgress> completedCourses = userProgressService.getCompletedCoursesByStudent(user.getId());
        return ResponseEntity.ok(completedCourses);
    }

    @GetMapping("/my/in-progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgress>> getMyInProgressCourses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<UserProgress> inProgressCourses = userProgressService.getInProgressCoursesByStudent(user.getId());
        return ResponseEntity.ok(inProgressCourses);
    }

    @PostMapping("/enroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long courseId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            UserProgress progress = userProgressService.enrollInCourse(user.getId(), courseId);
            return ResponseEntity.ok(new MessageResponse("Enrolled in course successfully!", true, progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error enrolling in course: " + e.getMessage(), false));
        }
    }

    @DeleteMapping("/unenroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> unenrollFromCourse(@PathVariable Long courseId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            userProgressService.unenrollFromCourse(user.getId(), courseId);
            return ResponseEntity.ok(new MessageResponse("Unenrolled from course successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error unenrolling from course: " + e.getMessage(), false));
        }
    }

    @PostMapping("/lesson/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveLessonProgress(@Valid @RequestBody LessonProgressRequest request, 
                                              Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            UserProgress progress = userProgressService.updateLessonProgress(
                user.getId(), 
                request.getCourseId(), 
                request.getLessonId(), 
                request.getTimeSpentMinutes(), 
                request.getCompleted()
            );
            return ResponseEntity.ok(new MessageResponse("Lesson progress saved successfully!", true, progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error saving lesson progress: " + e.getMessage(), false));
        }
    }

    @PutMapping("/reset/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> resetProgress(@PathVariable Long courseId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            UserProgress progress = userProgressService.resetProgress(user.getId(), courseId);
            return ResponseEntity.ok(new MessageResponse("Progress reset successfully!", true, progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error resetting progress: " + e.getMessage(), false));
        }
    }

    @GetMapping("/my/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Double averageCompletion = userProgressService.getAverageCompletionByStudent(user.getId());
        long completedCourses = userProgressService.getCompletedCoursesCount(user.getId());
        long enrolledCourses = userProgressService.getEnrolledCoursesCount(user.getId());
        
        final Double avgCompletion = averageCompletion;
        final long completedCoursesCount = completedCourses;
        final long enrolledCoursesCount = enrolledCourses;

        return ResponseEntity.ok(new MessageResponse("User statistics retrieved successfully!", true,
            new Object() {
                public final Double averageCompletion = avgCompletion != null ? avgCompletion : 0.0;
                public final long completedCourses = completedCoursesCount;
                public final long enrolledCourses = enrolledCoursesCount;
                public final long inProgressCourses = enrolledCoursesCount - completedCoursesCount;
            }));
    }

    // Teacher endpoints
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<UserProgress>> getProgressByCourse(@PathVariable Long courseId) {
        List<UserProgress> progress = userProgressService.getProgressByCourse(courseId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/course/{courseId}/stats")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getCourseStats(@PathVariable Long courseId) {
        Double averageCompletion = userProgressService.getAverageCompletionByCourse(courseId);
        long completedStudents = userProgressService.getCompletedStudentsCount(courseId);
        long enrolledStudents = userProgressService.getEnrolledStudentsCount(courseId);
        
        final Double avgCompletion = averageCompletion;
        final long completedStudentsCount = completedStudents;
        final long enrolledStudentsCount = enrolledStudents;

        return ResponseEntity.ok(new MessageResponse("Course statistics retrieved successfully!", true,
            new Object() {
                public final Double averageCompletion = avgCompletion != null ? avgCompletion : 0.0;
                public final long completedStudents = completedStudentsCount;
                public final long enrolledStudents = enrolledStudentsCount;
                public final long inProgressStudents = enrolledStudentsCount - completedStudentsCount;
            }));
    }

    @GetMapping("/high-performers")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<UserProgress>> getHighPerformers(@RequestParam(defaultValue = "80.0") Double minPercentage) {
        List<UserProgress> highPerformers = userProgressService.getHighPerformers(minPercentage);
        return ResponseEntity.ok(highPerformers);
    }
}
