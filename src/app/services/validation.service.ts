import { Injectable } from '@angular/core';
import { DocumentData } from './ocr.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
  qualityScore: number;
}

export interface ValidationRule {
  field: string;
  required: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  customValidator?: (value: string) => boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  private documentRules: { [key: string]: ValidationRule[] } = {
    'id': [
      { field: 'firstName', required: false, minLength: 2, errorMessage: 'First name must be at least 2 characters if provided' },
      { field: 'lastName', required: false, minLength: 2, errorMessage: 'Last name must be at least 2 characters if provided' },
      { field: 'idNumber', required: false, minLength: 3, errorMessage: 'ID number must be at least 3 characters if provided' },
      { field: 'dateOfBirth', required: false, pattern: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, errorMessage: 'Valid date of birth format required if provided' },
      { field: 'expiryDate', required: false, pattern: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, errorMessage: 'Valid expiry date format required if provided' }
    ],
    'receipt': [
      { field: 'merchant', required: true, minLength: 2, errorMessage: 'Merchant name is required' },
      { field: 'total', required: true, pattern: /^\d+\.?\d*$/, errorMessage: 'Valid total amount is required' },
      { field: 'date', required: true, pattern: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, errorMessage: 'Valid date is required' }
    ],
    'invoice': [
      { field: 'amount', required: true, pattern: /^\d+\.?\d*$/, errorMessage: 'Valid amount is required' },
      { field: 'vendor', required: true, minLength: 2, errorMessage: 'Vendor name is required' }
    ]
  };

  constructor() { }

  /**
   * Validate document data against business rules
   * @param documentData - The extracted document data
   * @returns Validation result with errors and warnings
   */
  validateDocument(documentData: DocumentData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check confidence level
    if (documentData.confidence < 70) {
      warnings.push(`Low confidence level: ${documentData.confidence.toFixed(1)}%. Manual review recommended.`);
    }
    
    if (documentData.confidence < 50) {
      errors.push(`Very low confidence level: ${documentData.confidence.toFixed(1)}%. Document may need to be rescanned.`);
    }

    // Validate against document type rules
    const rules = this.documentRules[documentData.documentType.toLowerCase()] || [];
    
    rules.forEach(rule => {
      const value = documentData.extractedData[rule.field];
      
      if (rule.required && (!value || value.trim() === '')) {
        errors.push(rule.errorMessage);
        return;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors.push(rule.errorMessage);
        return;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push(rule.errorMessage);
        return;
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.errorMessage);
        return;
      }
      
      if (value && rule.customValidator && !rule.customValidator(value)) {
        errors.push(rule.errorMessage);
        return;
      }
    });

    // Additional business logic validations
    this.validateBusinessRules(documentData, errors, warnings);

    const qualityScore = this.calculateQualityScore(documentData, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: documentData.confidence,
      qualityScore
    };
  }

  /**
   * Validate business-specific rules
   */
  private validateBusinessRules(documentData: DocumentData, errors: string[], warnings: string[]): void {
    switch (documentData.documentType.toLowerCase()) {
      case 'id':
        this.validateIDRules(documentData, errors, warnings);
        break;
      case 'receipt':
        this.validateReceiptRules(documentData, errors, warnings);
        break;
      case 'invoice':
        this.validateInvoiceRules(documentData, errors, warnings);
        break;
    }
  }

  private validateIDRules(documentData: DocumentData, errors: string[], warnings: string[]): void {
    const { extractedData } = documentData;
    
    // Check if ID is expired
    if (extractedData.expiryDate) {
      const expiryDate = new Date(extractedData.expiryDate);
      const today = new Date();
      
      if (expiryDate < today) {
        errors.push('ID document is expired');
      } else if (expiryDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        warnings.push('ID document expires within 30 days');
      }
    }
    
    // Check if person is of legal age (assuming 18+)
    if (extractedData.dateOfBirth) {
      const birthDate = new Date(extractedData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        warnings.push('Person appears to be under 18 years old');
      }
    }
  }

  private validateReceiptRules(documentData: DocumentData, errors: string[], warnings: string[]): void {
    const { extractedData } = documentData;
    
    // Check if receipt is recent (within last year)
    if (extractedData.date) {
      const receiptDate = new Date(extractedData.date);
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      
      if (receiptDate < oneYearAgo) {
        warnings.push('Receipt is over 1 year old');
      }
    }
    
    // Check for reasonable total amount
    if (extractedData.total) {
      const total = parseFloat(extractedData.total);
      if (total > 10000) {
        warnings.push('Receipt total is unusually high - please verify');
      }
      if (total <= 0) {
        errors.push('Receipt total must be greater than 0');
      }
    }
  }

  private validateInvoiceRules(documentData: DocumentData, errors: string[], warnings: string[]): void {
    const { extractedData } = documentData;
    
    // Check if invoice is overdue
    if (extractedData.dueDate) {
      const dueDate = new Date(extractedData.dueDate);
      const today = new Date();
      
      if (dueDate < today) {
        warnings.push('Invoice is overdue');
      }
    }
    
    // Check for reasonable invoice amount
    if (extractedData.amount) {
      const amount = parseFloat(extractedData.amount);
      if (amount > 100000) {
        warnings.push('Invoice amount is unusually high - please verify');
      }
      if (amount <= 0) {
        errors.push('Invoice amount must be greater than 0');
      }
    }
  }

  /**
   * Calculate quality score based on confidence and validation results
   */
  private calculateQualityScore(documentData: DocumentData, errors: string[], warnings: string[]): number {
    let score = documentData.confidence;
    
    // Deduct points for errors and warnings
    score -= errors.length * 20;
    score -= warnings.length * 5;
    
    // Bonus for complete data extraction
    const rules = this.documentRules[documentData.documentType.toLowerCase()] || [];
    const requiredFields = rules.filter(rule => rule.required).length;
    const extractedFields = Object.keys(documentData.extractedData).filter(key => 
      documentData.extractedData[key] && documentData.extractedData[key].trim() !== ''
    ).length;
    
    if (requiredFields > 0) {
      const completenessRatio = extractedFields / requiredFields;
      score += completenessRatio * 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if document meets minimum quality standards
   */
  isDocumentAcceptable(validationResult: ValidationResult): boolean {
    return validationResult.isValid && validationResult.qualityScore >= 60;
  }

  /**
   * Get validation suggestions for improving document quality
   */
  getImprovementSuggestions(validationResult: ValidationResult): string[] {
    const suggestions: string[] = [];
    
    if (validationResult.confidence < 80) {
      suggestions.push('Try scanning the document with better lighting and higher resolution');
    }
    
    if (validationResult.errors.length > 0) {
      suggestions.push('Please ensure all required fields are clearly visible and legible');
    }
    
    if (validationResult.warnings.length > 0) {
      suggestions.push('Review the extracted data for accuracy');
    }
    
    return suggestions;
  }
} 