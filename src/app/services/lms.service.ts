import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  lessons: Lesson[];
  enrolledStudents: number;
  rating: number;
  imageUrl?: string;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isCompleted: boolean;
  materials: string[];
  quiz?: Quiz;
}

export interface Quiz {
  id: number;
  lessonId: number;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
}

export interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

export interface Assignment {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  content: string;
  attachments: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

export interface StudentProgress {
  id: number;
  studentId: number;
  courseId: number;
  completedLessons: number[];
  currentLesson: number;
  overallProgress: number; // percentage
  timeSpent: number; // in minutes
  lastAccessed: Date;
  certificateEarned: boolean;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: StudentProgress;
}

@Injectable({
  providedIn: 'root'
})
export class LMSService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  private currentUserSubject = new BehaviorSubject<any>(null);

  public courses$ = this.coursesSubject.asObservable();
  public enrollments$ = this.enrollmentsSubject.asObservable();

  // Sample data
  private courses: Course[] = [
    {
      id: 1,
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
      instructor: 'Sarah Wilson',
      category: 'Programming',
      level: 'beginner',
      duration: 20,
      lessons: [
        {
          id: 1,
          courseId: 1,
          title: 'HTML Basics',
          description: 'Learn the structure of HTML documents and basic elements.',
          content: 'HTML is the standard markup language for creating web pages...',
          duration: 45,
          order: 1,
          isCompleted: false,
          materials: ['html-basics.pdf', 'code-examples.zip'],
          quiz: {
            id: 1,
            lessonId: 1,
            questions: [
              {
                id: 1,
                text: 'What does HTML stand for?',
                type: 'multiple-choice',
                options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'],
                correctAnswer: 0,
                points: 10
              }
            ],
            timeLimit: 15,
            passingScore: 70
          }
        },
        {
          id: 2,
          courseId: 1,
          title: 'CSS Styling',
          description: 'Learn how to style your HTML elements with CSS.',
          content: 'CSS is used to style and layout web pages...',
          duration: 60,
          order: 2,
          isCompleted: false,
          materials: ['css-guide.pdf'],
          quiz: {
            id: 2,
            lessonId: 2,
            questions: [
              {
                id: 2,
                text: 'Which CSS property is used to change the text color?',
                type: 'multiple-choice',
                options: ['text-color', 'color', 'font-color'],
                correctAnswer: 1,
                points: 10
              }
            ],
            timeLimit: 20,
            passingScore: 80
          }
        }
      ],
      enrolledStudents: 45,
      rating: 4.5,
      imageUrl: 'assets/img/courses/web-dev.jpg',
      price: 99.99,
      isPublished: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      description: 'Master JavaScript programming with ES6+ features and modern frameworks.',
      instructor: 'Mike Smith',
      category: 'Programming',
      level: 'advanced',
      duration: 30,
      lessons: [
        {
          id: 3,
          courseId: 2,
          title: 'ES6 Features',
          description: 'Learn modern JavaScript features like arrow functions and destructuring.',
          content: 'ES6 introduced many new features to JavaScript...',
          duration: 90,
          order: 1,
          isCompleted: false,
          materials: ['es6-guide.pdf', 'practice-exercises.zip'],
          quiz: {
            id: 3,
            lessonId: 3,
            questions: [
              {
                id: 3,
                text: 'What is the correct syntax for an arrow function?',
                type: 'multiple-choice',
                options: ['function() => {}', '() => {}', '=> function() {}'],
                correctAnswer: 1,
                points: 15
              }
            ],
            timeLimit: 25,
            passingScore: 75
          }
        }
      ],
      enrolledStudents: 28,
      rating: 4.8,
      imageUrl: 'assets/img/courses/javascript.jpg',
      price: 149.99,
      isPublished: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 3,
      title: 'Digital Marketing Fundamentals',
      description: 'Learn the basics of digital marketing including SEO, social media, and content marketing.',
      instructor: 'Emma Davis',
      category: 'Marketing',
      level: 'beginner',
      duration: 15,
      lessons: [
        {
          id: 4,
          courseId: 3,
          title: 'SEO Basics',
          description: 'Learn search engine optimization fundamentals.',
          content: 'SEO helps your website rank higher in search results...',
          duration: 75,
          order: 1,
          isCompleted: false,
          materials: ['seo-guide.pdf'],
          quiz: {
            id: 4,
            lessonId: 4,
            questions: [
              {
                id: 4,
                text: 'What does SEO stand for?',
                type: 'multiple-choice',
                options: ['Search Engine Optimization', 'Social Engine Optimization', 'Site Engine Optimization'],
                correctAnswer: 0,
                points: 10
              }
            ],
            timeLimit: 20,
            passingScore: 70
          }
        }
      ],
      enrolledStudents: 67,
      rating: 4.3,
      imageUrl: 'assets/img/courses/marketing.jpg',
      price: 79.99,
      isPublished: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  private enrollments: Enrollment[] = [
    {
      id: 1,
      studentId: 1,
      courseId: 1,
      enrolledAt: new Date('2024-01-20'),
      status: 'active',
      progress: {
        id: 1,
        studentId: 1,
        courseId: 1,
        completedLessons: [1],
        currentLesson: 2,
        overallProgress: 50,
        timeSpent: 120,
        lastAccessed: new Date(),
        certificateEarned: false
      }
    }
  ];

  constructor() {
    this.coursesSubject.next(this.courses);
    this.enrollmentsSubject.next(this.enrollments);
  }

  // Course Management
  getCourses(): Observable<Course[]> {
    return of(this.courses).pipe(delay(500));
  }

  getCourseById(id: number): Observable<Course | undefined> {
    const course = this.courses.find(c => c.id === id);
    return of(course).pipe(delay(300));
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    const newCourse: Course = {
      ...course,
      id: this.courses.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.push(newCourse);
    this.coursesSubject.next(this.courses);
    return of(newCourse).pipe(delay(1000));
  }

  updateCourse(id: number, updates: Partial<Course>): Observable<Course | undefined> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updates, updatedAt: new Date() };
      this.coursesSubject.next(this.courses);
      return of(this.courses[index]).pipe(delay(800));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteCourse(id: number): Observable<boolean> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses.splice(index, 1);
      this.coursesSubject.next(this.courses);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(300));
  }

  // Lesson Management
  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    const course = this.courses.find(c => c.id === courseId);
    return of(course?.lessons || []).pipe(delay(300));
  }

  getLessonById(lessonId: number): Observable<Lesson | undefined> {
    for (const course of this.courses) {
      const lesson = course.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return of(lesson).pipe(delay(300));
      }
    }
    return of(undefined).pipe(delay(300));
  }

  // Enrollment Management
  enrollInCourse(studentId: number, courseId: number): Observable<Enrollment> {
    const enrollment: Enrollment = {
      id: this.enrollments.length + 1,
      studentId,
      courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: {
        id: this.enrollments.length + 1,
        studentId,
        courseId,
        completedLessons: [],
        currentLesson: 1,
        overallProgress: 0,
        timeSpent: 0,
        lastAccessed: new Date(),
        certificateEarned: false
      }
    };
    this.enrollments.push(enrollment);
    this.enrollmentsSubject.next(this.enrollments);
    return of(enrollment).pipe(delay(800));
  }

  getEnrollmentsByStudent(studentId: number): Observable<Enrollment[]> {
    const studentEnrollments = this.enrollments.filter(e => e.studentId === studentId);
    return of(studentEnrollments).pipe(delay(500));
  }

  updateProgress(studentId: number, courseId: number, lessonId: number): Observable<StudentProgress | undefined> {
    const enrollment = this.enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (enrollment) {
      if (!enrollment.progress.completedLessons.includes(lessonId)) {
        enrollment.progress.completedLessons.push(lessonId);
      }
      enrollment.progress.currentLesson = lessonId + 1;
      enrollment.progress.lastAccessed = new Date();
      
      // Calculate overall progress
      const course = this.courses.find(c => c.id === courseId);
      if (course) {
        enrollment.progress.overallProgress = Math.round(
          (enrollment.progress.completedLessons.length / course.lessons.length) * 100
        );
      }
      
      this.enrollmentsSubject.next(this.enrollments);
      return of(enrollment.progress).pipe(delay(500));
    }
    return of(undefined).pipe(delay(300));
  }

  // Quiz Management
  submitQuiz(lessonId: number, answers: any[]): Observable<{ score: number; passed: boolean }> {
    const lesson = this.getLessonById(lessonId);
    // Simulate quiz grading
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const passed = score >= 70;
    return of({ score, passed }).pipe(delay(1000));
  }

  // Assignment Management
  getAssignmentsByCourse(courseId: number): Observable<Assignment[]> {
    // Mock assignments
    const assignments: Assignment[] = [
      {
        id: 1,
        courseId,
        title: 'Build a Personal Website',
        description: 'Create a personal website using HTML and CSS',
        dueDate: new Date('2024-02-15'),
        points: 100,
        submissions: []
      }
    ];
    return of(assignments).pipe(delay(500));
  }

  submitAssignment(assignmentId: number, studentId: number, content: string): Observable<AssignmentSubmission> {
    const submission: AssignmentSubmission = {
      id: Math.floor(Math.random() * 1000),
      assignmentId,
      studentId,
      content,
      attachments: [],
      submittedAt: new Date()
    };
    return of(submission).pipe(delay(800));
  }

  // Analytics
  getCourseAnalytics(courseId: number): Observable<any> {
    const course = this.courses.find(c => c.id === courseId);
    const courseEnrollments = this.enrollments.filter(e => e.courseId === courseId);
    
    const analytics = {
      totalEnrollments: courseEnrollments.length,
      activeStudents: courseEnrollments.filter(e => e.status === 'active').length,
      averageProgress: courseEnrollments.reduce((sum, e) => sum + e.progress.overallProgress, 0) / courseEnrollments.length || 0,
      completionRate: courseEnrollments.filter(e => e.status === 'completed').length / courseEnrollments.length * 100 || 0
    };
    
    return of(analytics).pipe(delay(600));
  }
} 