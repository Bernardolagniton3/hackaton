import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LMSService, Course, Enrollment } from '../../services/lms.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lms-dashboard',
  templateUrl: './lms-dashboard.component.html',
  styleUrls: ['./lms-dashboard.component.css']
})
export class LMSDashboardComponent implements OnInit {
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  currentUser: any = null;
  isLoading = false;
  selectedCategory = 'all';
  selectedLevel = 'all';

  categories = ['all', 'Managing earnings and expenses', 'Fuel-saving tips', 'Tax compliance for TNVS drivers', 'Budgeting and savings'];
  levels = ['all', 'beginner', 'intermediate', 'advanced'];

  constructor(
    private lmsService: LMSService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCourses();
    this.loadEnrollments();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.lmsService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading courses', 'Close', { duration: 3000 });
      }
    });
  }

  loadEnrollments(): void {
    if (this.currentUser) {
      this.lmsService.getEnrollmentsByStudent(this.currentUser.id).subscribe({
        next: (enrollments) => {
          this.enrollments = enrollments;
        },
        error: (error) => {
          console.error('Error loading enrollments:', error);
        }
      });
    }
  }

  getFilteredCourses(): Course[] {
    let filtered = this.courses;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === this.selectedCategory);
    }

    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === this.selectedLevel);
    }

    return filtered;
  }

  enrollInCourse(courseId: number): void {
    if (!this.currentUser) {
      this.snackBar.open('Please login to enroll in courses', 'Close', { duration: 3000 });
      return;
    }

    this.lmsService.enrollInCourse(this.currentUser.id, courseId).subscribe({
      next: (enrollment) => {
        this.snackBar.open('Successfully enrolled in course!', 'Close', { duration: 3000 });
        this.loadEnrollments();
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        this.snackBar.open('Error enrolling in course', 'Close', { duration: 3000 });
      }
    });
  }

  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/course', courseId]);
  }

  continueLearning(courseId: number): void {
    this.router.navigate(['/course', courseId]);
  }

  isEnrolled(courseId: number): boolean {
    return this.enrollments.some(enrollment => enrollment.courseId === courseId);
  }

  getEnrollmentProgress(courseId: number): number {
    const enrollment = this.enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.progress.overallProgress : 0;
  }

  getEnrollmentStatus(courseId: number): string {
    const enrollment = this.enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.status : '';
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Programming': return 'code';
      case 'Marketing': return 'trending_up';
      case 'Design': return 'palette';
      case 'Business': return 'business';
      default: return 'school';
    }
  }

  getTotalEnrolledCourses(): number {
    return this.enrollments.length;
  }

  getAverageProgress(): number {
    if (this.enrollments.length === 0) return 0;
    const totalProgress = this.enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.overallProgress, 0);
    return Math.round(totalProgress / this.enrollments.length);
  }

  getTotalTimeSpent(): number {
    return this.enrollments.reduce((sum, enrollment) => 
      sum + enrollment.progress.timeSpent, 0);
  }

  getCompletedCourses(): number {
    return this.enrollments.filter(e => e.status === 'completed').length;
  }

  goToCourse(course: Course): void {
    this.router.navigate(['/course', course.id]);
  }
} 