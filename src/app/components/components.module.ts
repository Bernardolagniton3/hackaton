import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { OCRPageComponent } from './ocr-page/ocr-page.component';
import { OCRProcessorComponent } from './ocr-processor/ocr-processor.component';
import { DocumentCaptureComponent } from './document-capture/document-capture.component';
import { LMSDashboardComponent } from './lms-dashboard/lms-dashboard.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { QuizDialogComponent } from './quiz-dialog/quiz-dialog.component';
import { AutomationResponseComponent } from './automation-response/automation-response.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    UserProfileComponent,
    OCRPageComponent,
    OCRProcessorComponent,
    DocumentCaptureComponent,
    LMSDashboardComponent,
    CourseDetailComponent,
    QuizDialogComponent,
    AutomationResponseComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    UserProfileComponent,
    OCRPageComponent,
    OCRProcessorComponent,
    DocumentCaptureComponent,
    LMSDashboardComponent,
    CourseDetailComponent,
    QuizDialogComponent,
    AutomationResponseComponent
  ]
})
export class ComponentsModule { }
