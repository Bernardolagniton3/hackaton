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
  // Define courses related to TNVS driver training
  // Define courses related to TNVS driver training without price
private courses: Course[] = [ 
  {
    id: 1,
    title: 'TNVS Driver Training 101: Introduction to TNVS',
    description: 'Learn the fundamentals of TNVS, vehicle safety, customer service, and regulations to become a successful driver.',
    instructor: 'Sarah Wilson',
    category: 'Driver Training',
    level: 'beginner',
    duration: 20,
    lessons: [
      {
        id: 1,
        courseId: 1,
        title: 'What is TNVS?',
        description: 'Understand what TNVS is and how it operates in the transportation ecosystem.',
        content: 'TNVS stands for Transport Network Vehicle Service, which allows drivers to use their private vehicles to transport passengers using a mobile app.',
        duration: 45,
        order: 1,
        isCompleted: false,
        materials: ['tnvs-introduction.pdf', 'tnvs-overview.pptx'],
        quiz: {
          id: 1,
          lessonId: 1,
          questions: [
            {
              id: 1,
              text: 'What does TNVS stand for?',
              type: 'multiple-choice',
              options: ['Transport Network Vehicle Service', 'Transnational Vehicle Safety Service', 'Transport Network Valet Service'],
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
        title: 'Vehicle Safety & Maintenance',
        description: 'Learn the essential vehicle safety measures and routine maintenance to ensure passenger and driver safety.',
        content: 'TNVS drivers are responsible for vehicle safety, which includes routine checks, maintenance, and addressing any safety concerns before each trip.',
        duration: 60,
        order: 2,
        isCompleted: false,
        materials: ['vehicle-safety-guide.pdf', 'maintenance-checklist.pdf'],
        quiz: {
          id: 2,
          lessonId: 2,
          questions: [
            {
              id: 2,
              text: 'What is the most important vehicle safety feature for TNVS drivers?',
              type: 'multiple-choice',
              options: ['Airbags', 'Brakes', 'Seat belts'],
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
    imageUrl: 'assets/img/courses/tnvs-introduction.jpg',
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: 'TNVS Driver Training 101: Customer Service & Communication',
    description: 'Master the essential skills needed for providing exceptional customer service in TNVS.',
    instructor: 'Mike Smith',
    category: 'Driver Training',
    level: 'beginner',
    duration: 30,
    lessons: [
      {
        id: 3,
        courseId: 2,
        title: 'Customer Service Essentials',
        description: 'Learn how to communicate professionally and handle customer requests and complaints.',
        content: 'Effective communication is a key skill for TNVS drivers. This lesson focuses on how to be polite, helpful, and resolve disputes.',
        duration: 90,
        order: 1,
        isCompleted: false,
        materials: ['customer-service-guide.pdf', 'communication-tips.pdf'],
        quiz: {
          id: 3,
          lessonId: 3,
          questions: [
            {
              id: 3,
              text: 'How should you handle a passenger who is complaining about the trip?',
              type: 'multiple-choice',
              options: ['Ignore the complaint', 'Apologize and resolve the issue calmly', 'Ask the passenger to get out of the car'],
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
    imageUrl: 'assets/img/courses/tnvs-customer-service.jpg',
    isPublished: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 3,
    title: 'TNVS Driver Training 101: Legal Responsibilities & Compliance',
    description: 'Understand the legal and regulatory requirements for TNVS drivers, including licensing, insurance, and passenger safety.',
    instructor: 'Emma Davis',
    category: 'Driver Training',
    level: 'beginner',
    duration: 15,
    lessons: [
      {
        id: 4,
        courseId: 3,
        title: 'Legal Requirements for TNVS Drivers',
        description: 'Learn about the legal obligations for TNVS drivers, including necessary documentation and insurance.',
        content: 'As a TNVS driver, it is critical to be familiar with local regulations, vehicle registration, and maintaining the right insurance coverage.',
        duration: 75,
        order: 1,
        isCompleted: false,
        materials: ['tnvs-legal-requirements.pdf', 'insurance-guide.pdf'],
        quiz: {
          id: 4,
          lessonId: 4,
          questions: [
            {
              id: 4,
              text: 'Which document is required to operate as a TNVS driver?',
              type: 'multiple-choice',
              options: ['Driving License', 'Passenger Car Registration', 'Vehicle Insurance'],
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
    imageUrl: 'assets/img/courses/tnvs-legal.jpg',
    isPublished: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

// Define enrollments for TNVS driver training
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