# OCR Document Capture + Validation System

A comprehensive Angular-based OCR (Optical Character Recognition) system that captures documents, extracts text, and validates the extracted data using advanced business rules.

## 🚀 Features

### Document Capture
- **Camera Integration**: Real-time document capture using webcam
- **File Upload**: Drag & drop or click to upload image files
- **Multiple Formats**: Supports JPG, PNG, BMP, TIFF formats
- **File Validation**: Size and format validation

### OCR Processing
- **Text Extraction**: Advanced OCR using Tesseract.js
- **Structured Data**: Automatic extraction of key fields based on document type
- **Confidence Scoring**: Quality assessment of OCR results
- **Raw Text Display**: Full extracted text for manual review

### Document Types Supported
- **ID Documents**: Driver's licenses, passports, national IDs
- **Receipts**: Purchase receipts, expense reports
- **Invoices**: Business invoices, billing documents
- **Other Documents**: General document processing

### Validation System
- **Business Rules**: Document-specific validation rules
- **Data Quality**: Confidence and completeness scoring
- **Error Detection**: Missing or invalid field identification
- **Warning System**: Quality improvement suggestions

### User Interface
- **Modern Design**: Material Design with beautiful gradients
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Feedback**: Progress indicators and status updates
- **Processing History**: Track previous document processing

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd material-dashboard-angular2-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install OCR-specific dependencies**
   ```bash
   npm install tesseract.js ngx-webcam@0.4.1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 📖 How to Use

### 1. Document Capture
- **Camera Method**: 
  - Click the "Camera" tab
  - Allow camera permissions when prompted
  - Position your document in the camera view
  - Click "Capture Document" to take a photo
  
- **Upload Method**:
  - Click the "Upload" tab
  - Drag & drop an image file or click "Choose File"
  - Supported formats: JPG, PNG, BMP, TIFF
  - Maximum file size: 10MB

### 2. Document Type Selection
- Choose the appropriate document type:
  - **ID Document**: For identification documents
  - **Receipt**: For purchase receipts
  - **Invoice**: For business invoices
  - **Other Document**: For general documents

### 3. Processing & Results
- The system will automatically:
  - Extract text from the image
  - Identify key data fields
  - Validate the extracted information
  - Provide confidence scores
  - Show validation results

### 4. Review & Export
- **Review Results**: Check extracted data and validation status
- **Export Data**: Download results as JSON file
- **Process History**: View previous document processing

## 🔧 Technical Architecture

### Core Components
- **DocumentCaptureComponent**: Handles camera and file upload
- **OCRProcessorComponent**: Main processing workflow
- **OCRService**: Text extraction and data structuring
- **ValidationService**: Business rules and quality assessment

### Key Technologies
- **Angular 14**: Frontend framework
- **Angular Material**: UI components
- **Tesseract.js**: OCR engine
- **ngx-webcam**: Camera integration
- **RxJS**: Reactive programming

### Data Flow
1. **Capture** → Document image captured via camera or upload
2. **Process** → OCR extracts text and structures data
3. **Validate** → Business rules applied to extracted data
4. **Display** → Results shown with confidence scores
5. **Export** → Data can be exported for further processing

## 📊 Validation Rules

### ID Documents
- **Required Fields**: Name, ID Number, Date of Birth, Expiry Date
- **Validation**: Expiry date check, age verification
- **Business Rules**: ID must not be expired, person must be 18+

### Receipts
- **Required Fields**: Merchant, Total Amount, Date
- **Validation**: Amount validation, date recency check
- **Business Rules**: Receipt should be recent, reasonable amounts

### Invoices
- **Required Fields**: Invoice Number, Amount, Vendor
- **Validation**: Amount validation, due date check
- **Business Rules**: Invoice should not be overdue

## 🎨 Customization

### Adding New Document Types
1. Update `documentTypes` array in `OCRProcessorComponent`
2. Add extraction rules in `OCRService.extractStructuredData()`
3. Add validation rules in `ValidationService.documentRules`

### Modifying Validation Rules
1. Edit validation rules in `ValidationService`
2. Update business logic in `validateBusinessRules()`
3. Adjust quality scoring in `calculateQualityScore()`

### Styling Customization
- Modify CSS files in component directories
- Update Material Design theme colors
- Adjust responsive breakpoints

## 🚨 Troubleshooting

### Common Issues

**Camera not working:**
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions for camera access
- Try refreshing the page

**OCR processing slow:**
- Use smaller image files
- Ensure good lighting for camera capture
- Check internet connection for Tesseract.js loading

**Validation errors:**
- Ensure document is clearly visible
- Check that all required fields are present
- Try capturing with better lighting

### Performance Tips
- Use images with good contrast and lighting
- Keep file sizes under 5MB for faster processing
- Ensure stable internet connection for OCR engine

## 📝 API Reference

### OCRService Methods
```typescript
extractTextFromImage(file: File): Observable<OCRResult>
processDocument(file: File, documentType: string): Observable<DocumentData>
```

### ValidationService Methods
```typescript
validateDocument(documentData: DocumentData): ValidationResult
isDocumentAcceptable(validationResult: ValidationResult): boolean
getImprovementSuggestions(validationResult: ValidationResult): string[]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console for error messages
3. Ensure all dependencies are properly installed
4. Verify browser compatibility

---

**Built with ❤️ using Angular and Material Design** 