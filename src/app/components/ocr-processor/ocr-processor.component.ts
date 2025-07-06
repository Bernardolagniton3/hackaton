import { Component, OnInit } from '@angular/core';
import { OCRService, DocumentData } from '../../services/ocr.service';
import { ValidationService, ValidationResult } from '../../services/validation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ocr-processor',
  templateUrl: './ocr-processor.component.html',
  styleUrls: ['./ocr-processor.component.css']
})
export class OCRProcessorComponent implements OnInit {
  
  // Document processing state
  public selectedDocumentType: string = 'id';
  public isProcessing: boolean = false;
  public processingProgress: number = 0;
  
  // Results
  public documentData: DocumentData | null = null;
  public validationResult: ValidationResult | null = null;
  public processingHistory: Array<{
    documentData: DocumentData;
    validationResult: ValidationResult;
    timestamp: Date;
  }> = [];

  // Document type options
  public documentTypes = [
    { value: 'id', label: 'ID Document', icon: 'badge' },
    { value: 'receipt', label: 'Receipt', icon: 'receipt' },
    { value: 'invoice', label: 'Invoice', icon: 'description' },
    { value: 'other', label: 'Other Document', icon: 'document_scanner' }
  ];

  constructor(
    private ocrService: OCRService,
    private validationService: ValidationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Load processing history from localStorage
    this.loadProcessingHistory();
  }

  /**
   * Handle document capture event
   */
  public onDocumentCaptured(file: File): void {
    this.processDocument(file);
  }

  /**
   * Process the captured document
   */
  private processDocument(file: File): void {
    this.isProcessing = true;
    this.processingProgress = 0;
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      this.processingProgress += 10;
      if (this.processingProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.ocrService.processDocument(file, this.selectedDocumentType)
      .subscribe({
        next: (documentData) => {
          this.documentData = documentData;
          this.processingProgress = 95;
          
          // Validate the extracted data
          this.validationResult = this.validationService.validateDocument(documentData);
          this.processingProgress = 100;
          
          // Add to processing history
          this.addToProcessingHistory(documentData, this.validationResult);
          
          // Show results
          this.showProcessingResults();
          
          clearInterval(progressInterval);
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('OCR processing error:', error);
          this.snackBar.open('Error processing document. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          clearInterval(progressInterval);
          this.isProcessing = false;
        }
      });
  }

  /**
   * Show processing results
   */
  private showProcessingResults(): void {
    if (!this.validationResult) return;

    if (this.validationService.isDocumentAcceptable(this.validationResult)) {
      this.snackBar.open('Document processed successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open('Document processed with issues. Please review.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  /**
   * Add document to processing history
   */
  private addToProcessingHistory(documentData: DocumentData, validationResult: ValidationResult): void {
    this.processingHistory.unshift({
      documentData,
      validationResult,
      timestamp: new Date()
    });

    // Keep only last 10 items
    if (this.processingHistory.length > 10) {
      this.processingHistory = this.processingHistory.slice(0, 10);
    }

    // Save to localStorage
    this.saveProcessingHistory();
  }

  /**
   * Save processing history to localStorage
   */
  private saveProcessingHistory(): void {
    try {
      localStorage.setItem('ocrProcessingHistory', JSON.stringify(this.processingHistory));
    } catch (error) {
      console.warn('Could not save processing history:', error);
    }
  }

  /**
   * Load processing history from localStorage
   */
  private loadProcessingHistory(): void {
    try {
      const history = localStorage.getItem('ocrProcessingHistory');
      if (history) {
        this.processingHistory = JSON.parse(history);
      }
    } catch (error) {
      console.warn('Could not load processing history:', error);
    }
  }

  /**
   * Clear processing history
   */
  public clearHistory(): void {
    this.processingHistory = [];
    localStorage.removeItem('ocrProcessingHistory');
    this.snackBar.open('Processing history cleared', 'Close', { duration: 2000 });
  }

  /**
   * Export processing results
   */
  public exportResults(): void {
    if (!this.documentData || !this.validationResult) {
      this.snackBar.open('No results to export', 'Close', { duration: 2000 });
      return;
    }

    const exportData = {
      documentData: this.documentData,
      validationResult: this.validationResult,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ocr-results-${Date.now()}.json`;
    link.click();
  }

  /**
   * Get improvement suggestions
   */
  public getImprovementSuggestions(): string[] {
    if (!this.validationResult) return [];
    return this.validationService.getImprovementSuggestions(this.validationResult);
  }

  /**
   * Get confidence color class
   */
  public getConfidenceColorClass(confidence: number): string {
    if (confidence >= 80) return 'high-confidence';
    if (confidence >= 60) return 'medium-confidence';
    return 'low-confidence';
  }

  /**
   * Get validation status color class
   */
  public getValidationStatusClass(validationResult: ValidationResult): string {
    if (validationResult.isValid && validationResult.qualityScore >= 80) return 'status-success';
    if (validationResult.isValid && validationResult.qualityScore >= 60) return 'status-warning';
    return 'status-error';
  }

  /**
   * Format extracted data for display
   */
  public getFormattedExtractedData(): Array<{key: string, value: string}> {
    if (!this.documentData) return [];
    
    return Object.entries(this.documentData.extractedData)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => ({
        key: this.formatFieldName(key),
        value: value
      }));
  }

  /**
   * Format field names for display
   */
  private formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Reset current processing
   */
  public resetProcessing(): void {
    this.documentData = null;
    this.validationResult = null;
    this.isProcessing = false;
    this.processingProgress = 0;
  }
} 