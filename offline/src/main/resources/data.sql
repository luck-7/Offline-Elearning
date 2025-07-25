-- Insert sample users (passwords are 'password123' encoded with BCrypt)
INSERT INTO users (id, username, email, password, first_name, last_name, role, created_at, updated_at) VALUES
(1, 'teacher1', 'teacher1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Smith', 'TEACHER', NOW(), NOW()),
(2, 'teacher2', 'teacher2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Sarah', 'Johnson', 'TEACHER', NOW(), NOW()),
(3, 'student1', 'student1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Alice', 'Brown', 'STUDENT', NOW(), NOW()),
(4, 'student2', 'student2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Bob', 'Wilson', 'STUDENT', NOW(), NOW()),
(5, 'student3', 'student3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Charlie', 'Davis', 'STUDENT', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, description, category, difficulty, estimated_duration, is_published, teacher_id, created_at, updated_at) VALUES
(1, 'Introduction to JavaScript', 'Learn the fundamentals of JavaScript programming language including variables, functions, and DOM manipulation.', 'Programming', 'Beginner', 480, true, 1, NOW(), NOW()),
(2, 'Advanced React Development', 'Master React.js with hooks, context, and advanced patterns for building modern web applications.', 'Programming', 'Advanced', 720, true, 1, NOW(), NOW()),
(3, 'Data Structures and Algorithms', 'Comprehensive course covering essential data structures and algorithms with practical implementations.', 'Computer Science', 'Intermediate', 600, true, 2, NOW(), NOW()),
(4, 'Web Design Fundamentals', 'Learn HTML, CSS, and responsive design principles to create beautiful and functional websites.', 'Design', 'Beginner', 360, true, 2, NOW(), NOW()),
(5, 'Machine Learning Basics', 'Introduction to machine learning concepts, algorithms, and practical applications using Python.', 'Data Science', 'Intermediate', 540, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (id, title, content, type, lesson_order, duration_minutes, course_id, created_at, updated_at) VALUES
-- JavaScript Course Lessons
(1, 'Variables and Data Types', 'Learn about JavaScript variables, primitive data types, and how to declare and use them in your programs.', 'TEXT', 1, 30, 1, NOW(), NOW()),
(2, 'Functions and Scope', 'Understanding JavaScript functions, parameters, return values, and variable scope concepts.', 'VIDEO', 2, 45, 1, NOW(), NOW()),
(3, 'DOM Manipulation', 'Interactive lesson on how to select and manipulate HTML elements using JavaScript.', 'INTERACTIVE', 3, 60, 1, NOW(), NOW()),
(4, 'JavaScript Quiz 1', 'Test your knowledge of JavaScript basics with this comprehensive quiz.', 'QUIZ', 4, 20, 1, NOW(), NOW()),

-- React Course Lessons
(5, 'React Components', 'Introduction to React components, JSX syntax, and component lifecycle.', 'TEXT', 1, 40, 2, NOW(), NOW()),
(6, 'State and Props', 'Understanding React state management and prop passing between components.', 'VIDEO', 2, 50, 2, NOW(), NOW()),
(7, 'React Hooks', 'Deep dive into React hooks including useState, useEffect, and custom hooks.', 'INTERACTIVE', 3, 70, 2, NOW(), NOW()),

-- Data Structures Course Lessons
(8, 'Arrays and Lists', 'Comprehensive overview of arrays, dynamic arrays, and linked lists.', 'DIAGRAM', 1, 45, 3, NOW(), NOW()),
(9, 'Stacks and Queues', 'Understanding stack and queue data structures with practical examples.', 'TEXT', 2, 40, 3, NOW(), NOW()),
(10, 'Trees and Graphs', 'Introduction to tree and graph data structures and their applications.', 'DIAGRAM', 3, 60, 3, NOW(), NOW()),

-- Web Design Course Lessons
(11, 'HTML Fundamentals', 'Learn HTML structure, semantic elements, and best practices for web markup.', 'TEXT', 1, 35, 4, NOW(), NOW()),
(12, 'CSS Styling', 'Master CSS selectors, properties, and layout techniques for beautiful designs.', 'INTERACTIVE', 2, 55, 4, NOW(), NOW()),
(13, 'Responsive Design', 'Create responsive websites that work on all devices using CSS media queries.', 'VIDEO', 3, 50, 4, NOW(), NOW()),

-- Machine Learning Course Lessons
(14, 'ML Introduction', 'Overview of machine learning concepts, types, and real-world applications.', 'TEXT', 1, 40, 5, NOW(), NOW()),
(15, 'Linear Regression', 'Understanding linear regression algorithm and its implementation in Python.', 'INTERACTIVE', 2, 60, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (id, title, question, type, options, correct_answer, explanation, points, lesson_id, created_at, updated_at) VALUES
(1, 'Variable Declaration', 'Which keyword is used to declare a variable in JavaScript?', 'MULTIPLE_CHOICE', '["var", "let", "const", "All of the above"]', 'All of the above', 'JavaScript supports var, let, and const for variable declaration, each with different scoping rules.', 1, 1, NOW(), NOW()),
(2, 'Function Syntax', 'What is the correct syntax for declaring a function in JavaScript?', 'MULTIPLE_CHOICE', '["function myFunc() {}", "def myFunc():", "func myFunc() {}", "function: myFunc() {}"]', 'function myFunc() {}', 'JavaScript functions are declared using the function keyword followed by the function name and parentheses.', 1, 2, NOW(), NOW()),
(3, 'DOM Selection', 'Which method is used to select an element by ID in JavaScript?', 'FILL_BLANK', '[]', 'getElementById', 'The getElementById() method returns the element with the specified ID attribute.', 1, 3, NOW(), NOW()),
(4, 'React Component', 'True or False: React components must return a single root element.', 'TRUE_FALSE', '["True", "False"]', 'False', 'With React 16+, components can return fragments or arrays of elements, not just a single root element.', 1, 5, NOW(), NOW()),
(5, 'Array Access', 'How do you access the first element of an array in most programming languages?', 'MULTIPLE_CHOICE', '["array[0]", "array[1]", "array.first()", "array.get(0)"]', 'array[0]', 'Arrays are typically zero-indexed, so the first element is accessed with index 0.', 1, 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
