package com.elearning.service;

import com.elearning.entity.Course;
import com.elearning.entity.User;
import com.elearning.repository.CourseRepository;
import com.elearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Course> getAllPublishedCourses() {
        return courseRepository.findPublishedCoursesOrderByCreatedAtDesc();
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
    }

    public List<Course> searchCourses(String searchTerm) {
        return courseRepository.searchPublishedCourses(searchTerm);
    }

    public List<Course> filterCourses(String searchTerm, String category, String difficulty) {
        return courseRepository.filterCourses(searchTerm, category, difficulty);
    }

    public List<String> getAllCategories() {
        return courseRepository.findDistinctCategories();
    }

    public List<String> getAllDifficulties() {
        return courseRepository.findDistinctDifficulties();
    }

    public Course createCourse(Course course, Long teacherId) {
        Optional<User> teacher = userRepository.findById(teacherId);
        if (teacher.isPresent() && teacher.get().getRole() == User.Role.TEACHER) {
            course.setTeacher(teacher.get());
            return courseRepository.save(course);
        }
        throw new RuntimeException("Teacher not found or invalid role");
    }

    public Course updateCourse(Long courseId, Course updatedCourse, Long teacherId) {
        Optional<Course> existingCourse = courseRepository.findById(courseId);
        if (existingCourse.isPresent()) {
            Course course = existingCourse.get();
            
            // Check if the teacher owns this course
            if (!course.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to update this course");
            }

            course.setTitle(updatedCourse.getTitle());
            course.setDescription(updatedCourse.getDescription());
            course.setCategory(updatedCourse.getCategory());
            course.setDifficulty(updatedCourse.getDifficulty());
            course.setEstimatedDuration(updatedCourse.getEstimatedDuration());
            course.setThumbnailUrl(updatedCourse.getThumbnailUrl());
            course.setIsPublished(updatedCourse.getIsPublished());

            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found");
    }

    public void deleteCourse(Long courseId, Long teacherId) {
        Optional<Course> course = courseRepository.findById(courseId);
        if (course.isPresent()) {
            // Check if the teacher owns this course
            if (!course.get().getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to delete this course");
            }
            courseRepository.deleteById(courseId);
        } else {
            throw new RuntimeException("Course not found");
        }
    }

    public Course publishCourse(Long courseId, Long teacherId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            
            // Check if the teacher owns this course
            if (!course.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to publish this course");
            }

            course.setIsPublished(true);
            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found");
    }

    public Course unpublishCourse(Long courseId, Long teacherId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            
            // Check if the teacher owns this course
            if (!course.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Unauthorized to unpublish this course");
            }

            course.setIsPublished(false);
            return courseRepository.save(course);
        }
        throw new RuntimeException("Course not found");
    }

    public long getPublishedCoursesCount() {
        return courseRepository.countPublishedCourses();
    }

    public long getCoursesByTeacherCount(Long teacherId) {
        return courseRepository.countByTeacherId(teacherId);
    }
}
