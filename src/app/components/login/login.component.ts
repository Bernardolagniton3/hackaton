import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  // Available users for demo
  demoUsers = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'jane.doe', password: 'password123', role: 'Manager' },
    { username: 'mike.smith', password: 'password123', role: 'User' },
    { username: 'sarah.wilson', password: 'password123', role: 'User' },
    { username: 'david.brown', password: 'password123', role: 'Manager' },
    { username: 'emma.davis', password: 'password123', role: 'User' },
    { username: 'james.miller', password: 'password123', role: 'User' },
    { username: 'lisa.garcia', password: 'password123', role: 'User' },
    { username: 'robert.johnson', password: 'password123', role: 'Manager' },
    { username: 'anna.taylor', password: 'password123', role: 'User' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginCredentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.success) {
            this.snackBar.open(result.message, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(result.message, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.snackBar.open('An error occurred during login. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Fill form with demo user credentials
   */
  fillDemoUser(user: any): void {
    this.loginForm.patchValue({
      username: user.username,
      password: user.password
    });
  }

  /**
   * Get form field error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }
} 