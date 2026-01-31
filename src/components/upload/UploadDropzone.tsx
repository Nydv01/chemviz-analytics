/**
 * File Upload Dropzone Component
 * 
 * Handles CSV file uploads with drag-and-drop support.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadResult?: {
    success: boolean;
    message: string;
    recordsProcessed?: number;
    warnings?: string[];
  } | null;
  onReset?: () => void;
}

export function UploadDropzone({
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  uploadResult,
  onReset,
}: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    onReset?.();
  };

  // Show result state
  if (uploadResult) {
    return (
      <div className="upload-zone p-8">
        <div className="flex flex-col items-center">
          {uploadResult.success ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Successful</h3>
              <p className="text-muted-foreground text-center mb-4">
                {uploadResult.message}
              </p>
              {uploadResult.recordsProcessed && (
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-mono font-medium text-foreground">
                    {uploadResult.recordsProcessed}
                  </span> records processed
                </p>
              )}
              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <div className="w-full max-w-md bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-warning mb-2">Warnings</h4>
                  <ul className="text-sm text-warning/80 space-y-1">
                    {uploadResult.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={handleReset}>Upload Another File</Button>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Failed</h3>
              <p className="text-muted-foreground text-center mb-4">
                {uploadResult.message}
              </p>
              <Button onClick={handleReset}>Try Again</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show uploading state
  if (isUploading) {
    return (
      <div className="upload-zone p-8">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-pulse-subtle">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Uploading...</h3>
          <p className="text-muted-foreground text-center mb-4">
            Processing {selectedFile?.name}
          </p>
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
        </div>
      </div>
    );
  }

  // Show file selected state
  if (selectedFile) {
    return (
      <div className="upload-zone p-8">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Upload</h3>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2 mb-4">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedFile(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Analyze
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show dropzone
  return (
    <div
      {...getRootProps()}
      className={cn(
        "upload-zone cursor-pointer p-12",
        isDragActive && "active"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <Upload className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragActive ? 'Drop your file here' : 'Upload CSV File'}
        </h3>
        <p className="text-muted-foreground text-center mb-4">
          Drag and drop your equipment data CSV, or click to browse
        </p>
        <p className="text-sm text-muted-foreground">
          Supports: CSV files up to 10MB
        </p>
      </div>
    </div>
  );
}
