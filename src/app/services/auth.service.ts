import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  lastLogin?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Dummy users data
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      email: 'admin@company.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'admin',
      avatar: 'assets/img/faces/avatar.jpg'
    },
    {
      id: 2,
      username: 'jane.doe',
      password: 'password123',
      email: 'jane.doe@company.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'manager',
      avatar: 'assets/img/faces/avatar-1.jpg'
    },
    {
      id: 3,
      username: 'mike.smith',
      password: 'password123',
      email: 'mike.smith@company.com',
      firstName: 'Mike',
      lastName: 'Smith',
      role: 'user',
      avatar: 'assets/img/faces/avatar-2.jpg'
    },
    {
      id: 4,
      username: 'sarah.wilson',
      password: 'password123',
      email: 'sarah.wilson@company.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'user',
      avatar: 'assets/img/faces/avatar-3.jpg'
    },
    {
      id: 5,
      username: 'david.brown',
      password: 'password123',
      email: 'david.brown@company.com',
      firstName: 'David',
      lastName: 'Brown',
      role: 'manager',
      avatar: 'assets/img/faces/avatar-4.jpg'
    },
    {
      id: 6,
      username: 'emma.davis',
      password: 'password123',
      email: 'emma.davis@company.com',
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'user',
      avatar: 'assets/img/faces/avatar-5.jpg'
    },
    {
      id: 7,
      username: 'james.miller',
      password: 'password123',
      email: 'james.miller@company.com',
      firstName: 'James',
      lastName: 'Miller',
      role: 'user',
      avatar: 'assets/img/faces/avatar-6.jpg'
    },
    {
      id: 8,
      username: 'lisa.garcia',
      password: 'password123',
      email: 'lisa.garcia@company.com',
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'user',
      avatar: 'assets/img/faces/avatar-7.jpg'
    },
    {
      id: 9,
      username: 'robert.johnson',
      password: 'password123',
      email: 'robert.johnson@company.com',
      firstName: 'Robert',
      lastName: 'Johnson',
      role: 'manager',
      avatar: 'assets/img/faces/avatar-8.jpg'
    },
    {
      id: 10,
      username: 'anna.taylor',
      password: 'password123',
      email: 'anna.taylor@company.com',
      firstName: 'Anna',
      lastName: 'Taylor',
      role: 'user',
      avatar: 'assets/img/faces/avatar-9.jpg'
    }
  ];

  constructor() {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string; user?: User }> {
    const user = this.users.find(u => 
      u.username.toLowerCase() === credentials.username.toLowerCase() && 
      u.password === credentials.password
    );

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      return of({ success: true, message: 'Login successful!', user }).pipe(delay(1000));
    } else {
      return of({ success: false, message: 'Invalid username or password' }).pipe(delay(1000));
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers(): User[] {
    return this.users.map(user => ({
      ...user,
      password: '********' // Hide passwords
    }));
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<{ success: boolean; message: string }> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of({ success: false, message: 'No user logged in' });
    }

    // Update user in the array
    const userIndex = this.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      
      // Update current user
      const updatedUser = this.users[userIndex];
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      
      return of({ success: true, message: 'Profile updated successfully' });
    }

    return of({ success: false, message: 'User not found' });
  }
} 