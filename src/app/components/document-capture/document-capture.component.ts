import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-capture',
  templateUrl: './document-capture.component.html',
  styleUrls: ['./document-capture.component.css']
})
export class DocumentCaptureComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() documentCaptured = new EventEmitter<File>();

  // Webcam properties
  public webcamImage: WebcamImage | null = null;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string = '';
  public videoOptions: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };
  public errors: WebcamInitError[] = [];

  // File upload properties
  public selectedFile: File | null = null;
  public previewUrl: string | null = null;
  public isProcessing = false;

  // Webcam trigger
  private trigger: Subject<void> = new Subject<void>();
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.checkWebcamAvailability();
  }

  private checkWebcamAvailability(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  // Webcam methods
  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    console.error('Webcam error:', error);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.convertWebcamImageToFile(webcamImage);
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.webcamImage = null;
  }

  // File upload methods
  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.createPreviewUrl(file);
    this.emitDocumentCaptured(file);
  }

  private createPreviewUrl(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private convertWebcamImageToFile(webcamImage: WebcamImage): void {
    // Convert base64 to blob
    const base64Data = webcamImage.imageAsBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Create file from blob
    const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    this.selectedFile = file;
    this.previewUrl = webcamImage.imageAsDataUrl;
    this.emitDocumentCaptured(file);
  }

  private emitDocumentCaptured(file: File): void {
    this.isProcessing = true;
    this.documentCaptured.emit(file);
    
    // Reset processing state after a short delay
    setTimeout(() => {
      this.isProcessing = false;
    }, 1000);
  }

  public clearSelection(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.webcamImage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  public getSupportedFileTypes(): string {
    return '.jpg,.jpeg,.png,.bmp,.tiff';
  }

  public getMaxFileSize(): string {
    return '10MB';
  }
} 