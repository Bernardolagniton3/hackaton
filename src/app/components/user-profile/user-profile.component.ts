import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        username: this.currentUser.username
      });
    }
  }

  /**
   * Toggle edit mode
   */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values
      this.profileForm.patchValue({
        firstName: this.currentUser?.firstName,
        lastName: this.currentUser?.lastName,
        email: this.currentUser?.email,
        username: this.currentUser?.username
      });
    }
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      const updates = this.profileForm.value;

      this.authService.updateProfile(updates).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.success) {
            this.currentUser = this.authService.getCurrentUser();
            this.isEditing = false;
            this.snackBar.open(result.message, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open(result.message, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Profile update error:', error);
          this.snackBar.open('An error occurred while updating profile.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Get form field error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  /**
   * Get user role display name
   */
  getUserRole(): string {
    if (this.currentUser) {
      return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
    }
    return '';
  }

  /**
   * Get last login date
   */
  getLastLogin(): string {
    if (this.currentUser?.lastLogin) {
      return new Date(this.currentUser.lastLogin).toLocaleString();
    }
    return 'Never';
  }
} 