import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LMSService, Course, Lesson, Enrollment } from '../../services/lms.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { QuizDialogComponent, QuizDialogData } from '../quiz-dialog/quiz-dialog.component';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  lessons: Lesson[] = [];
  currentUser: any = null;
  enrollment: Enrollment | null = null;
  isLoading = false;
  selectedLesson: Lesson | null = null;
  isLessonView = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lmsService: LMSService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCourse();
  }

  loadCourse(): void {
    this.isLoading = true;
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.lmsService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course = course;
          this.lessons = course.lessons;
          this.loadEnrollment(courseId);
        } else {
          this.snackBar.open('Course not found', 'Close', { duration: 3000 });
          this.router.navigate(['/lms']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading course', 'Close', { duration: 3000 });
      }
    });
  }

  loadEnrollment(courseId: number): void {
    if (this.currentUser) {
      this.lmsService.getEnrollmentsByStudent(this.currentUser.id).subscribe({
        next: (enrollments) => {
          this.enrollment = enrollments.find(e => e.courseId === courseId) || null;
        },
        error: (error) => {
          console.error('Error loading enrollment:', error);
        }
      });
    }
  }

  enrollInCourse(): void {
    if (!this.currentUser) {
      this.snackBar.open('Please login to enroll in this course', 'Close', { duration: 3000 });
      return;
    }

    if (!this.course) return;

    this.lmsService.enrollInCourse(this.currentUser.id, this.course.id).subscribe({
      next: (enrollment) => {
        this.enrollment = enrollment;
        this.snackBar.open('Successfully enrolled in course!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        this.snackBar.open('Error enrolling in course', 'Close', { duration: 3000 });
      }
    });
  }

  isLessonCompleted(lessonId: number): boolean {
    return this.enrollment?.progress.completedLessons.includes(lessonId) || false;
  }

  getCurrentLesson(): number {
    return this.enrollment?.progress.currentLesson || 1;
  }

  canAccessLesson(lesson: Lesson): boolean {
    if (!this.enrollment) return false;
    
    // First lesson is always accessible
    if (lesson.order === 1) return true;
    
    // Check if previous lesson is completed
    const previousLesson = this.lessons.find(l => l.order === lesson.order - 1);
    return previousLesson ? this.isLessonCompleted(previousLesson.id) : false;
  }

  startLesson(lesson: Lesson): void {
    if (!this.canAccessLesson(lesson)) {
      this.snackBar.open('Please complete the previous lesson first', 'Close', { duration: 3000 });
      return;
    }

    this.selectedLesson = lesson;
    this.isLessonView = true;
  }

  completeLesson(lesson: Lesson): void {
    if (!this.currentUser || !this.course) return;

    this.lmsService.updateProgress(this.currentUser.id, this.course.id, lesson.id).subscribe({
      next: (progress) => {
        if (this.enrollment) {
          this.enrollment.progress = progress;
        }
        this.snackBar.open('Lesson completed!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error completing lesson:', error);
        this.snackBar.open('Error completing lesson', 'Close', { duration: 3000 });
      }
    });
  }

  takeQuiz(lesson: Lesson): void {
    if (!lesson.quiz) return;

    const dialogData: QuizDialogData = {
      quiz: lesson.quiz,
      lessonTitle: lesson.title
    };

    const dialogRef = this.dialog.open(QuizDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.passed) {
        this.snackBar.open('Quiz completed successfully!', 'Close', { duration: 3000 });
        // Optionally mark lesson as completed after passing quiz
        this.completeLesson(lesson);
      }
    });
  }

  backToCourse(): void {
    this.isLessonView = false;
    this.selectedLesson = null;
  }

  getProgressPercentage(): number {
    if (!this.enrollment || !this.course) return 0;
    return this.enrollment.progress.overallProgress;
  }

  getCompletedLessonsCount(): number {
    return this.enrollment?.progress.completedLessons.length || 0;
  }

  getTotalLessonsCount(): number {
    return this.lessons.length;
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

  downloadMaterial(material: string): void {
    // Simulate download
    this.snackBar.open(`Downloading ${material}...`, 'Close', { duration: 2000 });
  }

  getEstimatedTime(): string {
    const totalMinutes = this.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  getQuizzesCount(): number {
    return this.lessons.filter(l => l.quiz).length;
  }

  hasMaterials(): boolean {
    return this.lessons.some(l => l.materials.length > 0);
  }
} 