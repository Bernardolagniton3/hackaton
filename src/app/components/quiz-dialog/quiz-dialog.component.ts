import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LMSService, Quiz, Question } from '../../services/lms.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface QuizDialogData {
  quiz: Quiz;
  lessonTitle: string;
}

@Component({
  selector: 'app-quiz-dialog',
  templateUrl: './quiz-dialog.component.html',
  styleUrls: ['./quiz-dialog.component.css']
})
export class QuizDialogComponent implements OnInit {
  quiz: Quiz;
  lessonTitle: string;
  currentQuestionIndex = 0;
  answers: any[] = [];
  timeRemaining: number = 0;
  isQuizCompleted = false;
  quizResults: any = null;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuizDialogData,
    private dialogRef: MatDialogRef<QuizDialogComponent>,
    private lmsService: LMSService,
    private snackBar: MatSnackBar
  ) {
    this.quiz = data.quiz;
    this.lessonTitle = data.lessonTitle;
    this.timeRemaining = this.quiz.timeLimit * 60; // Convert to seconds
  }

  ngOnInit(): void {
    this.startTimer();
    this.initializeAnswers();
  }

  initializeAnswers(): void {
    this.answers = new Array(this.quiz.questions.length).fill(null);
  }

  startTimer(): void {
    const timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.submitQuiz();
      }
    }, 1000);
  }

  getCurrentQuestion(): Question {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  getProgressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  getTimeDisplay(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  selectAnswer(answer: any): void {
    this.answers[this.currentQuestionIndex] = answer;
  }

  isAnswerSelected(answer: any): boolean {
    return this.answers[this.currentQuestionIndex] === answer;
  }

  submitQuiz(): void {
    this.isLoading = true;
    
    // Simulate quiz submission
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      const passed = score >= this.quiz.passingScore;
      
      this.quizResults = {
        score,
        passed,
        totalQuestions: this.quiz.questions.length,
        correctAnswers: Math.floor((score / 100) * this.quiz.questions.length),
        timeSpent: (this.quiz.timeLimit * 60) - this.timeRemaining
      };
      
      this.isQuizCompleted = true;
      this.isLoading = false;
      
      if (passed) {
        this.snackBar.open('Congratulations! You passed the quiz!', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Quiz failed. Please try again.', 'Close', { duration: 3000 });
      }
    }, 1000);
  }

  closeDialog(): void {
    this.dialogRef.close(this.quizResults);
  }

  retakeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.initializeAnswers();
    this.isQuizCompleted = false;
    this.quizResults = null;
    this.timeRemaining = this.quiz.timeLimit * 60;
    this.startTimer();
  }

  getQuestionTypeDisplay(type: string): string {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'essay': return 'Essay';
      default: return type;
    }
  }
} 