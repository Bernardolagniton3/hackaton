import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Import Tesseract.js using require for better compatibility
const Tesseract = require('tesseract.js');

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export interface DocumentData {
  documentType: string;
  extractedData: { [key: string]: string };
  confidence: number;
  rawText: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class OCRService {

  constructor() { }

  /**
   * Extract text from an image using OCR
   * @param imageFile - The image file to process
   * @returns Observable with OCR result
   */
  extractTextFromImage(imageFile: File): Observable<OCRResult> {
    return from(this.performOCR(imageFile));
  }

  /**
   * Extract text from image URL
   * @param imageUrl - URL of the image to process
   * @returns Observable with OCR result
   */
  extractTextFromImageUrl(imageUrl: string): Observable<OCRResult> {
    return from(this.performOCRFromUrl(imageUrl));
  }

  /**
   * Process document and extract structured data
   * @param imageFile - The document image
   * @param documentType - Type of document (id, receipt, invoice, etc.)
   * @returns Observable with structured document data
   */
  processDocument(imageFile: File, documentType: string): Observable<DocumentData> {
    return this.extractTextFromImage(imageFile).pipe(
      map(result => this.structureDocumentData(result, documentType, imageFile))
    );
  }

  private async performOCR(imageFile: File): Promise<OCRResult> {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    try {
      const { data } = await worker.recognize(imageFile);
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
      };
    } finally {
      await worker.terminate();
    }
  }

  private async performOCRFromUrl(imageUrl: string): Promise<OCRResult> {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    try {
      const { data } = await worker.recognize(imageUrl);
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
      };
    } finally {
      await worker.terminate();
    }
  }

  private structureDocumentData(ocrResult: OCRResult, documentType: string, imageFile: File): DocumentData {
    const extractedData = this.extractStructuredData(ocrResult.text, documentType);
    
    return {
      documentType,
      extractedData,
      confidence: ocrResult.confidence,
      rawText: ocrResult.text,
      imageUrl: URL.createObjectURL(imageFile)
    };
  }

  private extractStructuredData(text: string, documentType: string): { [key: string]: string } {
    const data: { [key: string]: string } = {};
    
    switch (documentType.toLowerCase()) {
      case 'id':
        data.firstName = this.extractFirstName(text);
        data.lastName = this.extractLastName(text);
        data.idNumber = this.extractIDNumber(text);
        data.dateOfBirth = this.extractDateOfBirth(text);
        data.expiryDate = this.extractExpiryDate(text);
        break;
      case 'receipt':
        data.merchant = this.extractMerchant(text);
        data.total = this.extractTotal(text);
        data.date = this.extractDate(text);
        data.items = this.extractItems(text);
        break;
      case 'invoice':
        data.invoiceNumber = this.extractInvoiceNumber(text);
        data.amount = this.extractAmount(text);
        data.dueDate = this.extractDueDate(text);
        data.vendor = this.extractVendor(text);
        break;
      default:
        data.rawText = text;
    }
    
    return data;
  }

  // Helper methods for data extraction
  private extractFirstName(text: string): string {
    // Look for first name patterns
    const firstNameMatch = text.match(/(?:FIRST\s*NAME|First\s*Name|Given\s*Name)[:\s]*([A-Za-z]+)/i);
    if (firstNameMatch) return firstNameMatch[1].trim();
    
    // Fallback: look for common first name patterns
    const nameMatch = text.match(/(?:NAME|Name)[:\s]*([A-Za-z]+)\s+([A-Za-z]+)/i);
    if (nameMatch) return nameMatch[1].trim();
    
    return '';
  }

  private extractLastName(text: string): string {
    // Look for last name patterns
    const lastNameMatch = text.match(/(?:LAST\s*NAME|Last\s*Name|Surname|Family\s*Name)[:\s]*([A-Za-z]+)/i);
    if (lastNameMatch) return lastNameMatch[1].trim();
    
    // Fallback: look for common name patterns
    const nameMatch = text.match(/(?:NAME|Name)[:\s]*([A-Za-z]+)\s+([A-Za-z]+)/i);
    if (nameMatch) return nameMatch[2].trim();
    
    return '';
  }

  private extractIDNumber(text: string): string {
    const idMatch = text.match(/(?:ID|ID\s*#|Number)[:\s]*([A-Z0-9-]+)/i);
    return idMatch ? idMatch[1].trim() : '';
  }

  private extractDateOfBirth(text: string): string {
    const dobMatch = text.match(/(?:DOB|Date of Birth|Birth)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return dobMatch ? dobMatch[1].trim() : '';
  }

  private extractExpiryDate(text: string): string {
    const expiryMatch = text.match(/(?:EXP|Expiry|Expires)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return expiryMatch ? expiryMatch[1].trim() : '';
  }

  private extractMerchant(text: string): string {
    const merchantMatch = text.match(/(?:MERCHANT|Store|Business)[:\s]*([A-Za-z\s]+)/i);
    return merchantMatch ? merchantMatch[1].trim() : '';
  }

  private extractTotal(text: string): string {
    const totalMatch = text.match(/(?:TOTAL|Total|Amount)[:\s]*\$?(\d+\.?\d*)/i);
    return totalMatch ? totalMatch[1].trim() : '';
  }

  private extractDate(text: string): string {
    const dateMatch = text.match(/(?:DATE|Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return dateMatch ? dateMatch[1].trim() : '';
  }

  private extractItems(text: string): string {
    // Extract items from receipt - simplified
    const lines = text.split('\n');
    const itemLines = lines.filter(line => 
      line.match(/\$?\d+\.?\d*/) && !line.match(/(?:TOTAL|TAX|SUBTOTAL)/i)
    );
    return itemLines.join(', ');
  }

  private extractInvoiceNumber(text: string): string {
    const invoiceMatch = text.match(/(?:INVOICE|Invoice|#)[:\s]*([A-Z0-9-]+)/i);
    return invoiceMatch ? invoiceMatch[1].trim() : '';
  }

  private extractAmount(text: string): string {
    const amountMatch = text.match(/(?:AMOUNT|Amount|Due)[:\s]*\$?(\d+\.?\d*)/i);
    return amountMatch ? amountMatch[1].trim() : '';
  }

  private extractDueDate(text: string): string {
    const dueMatch = text.match(/(?:DUE|Due Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return dueMatch ? dueMatch[1].trim() : '';
  }

  private extractVendor(text: string): string {
    const vendorMatch = text.match(/(?:VENDOR|From|Company)[:\s]*([A-Za-z\s]+)/i);
    return vendorMatch ? vendorMatch[1].trim() : '';
  }
} 