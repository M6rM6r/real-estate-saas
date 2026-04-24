'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader as Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageFile {
  file: File;
  preview: string;
  progress: number;
  id: string;
}

interface ImageUploadPreviewProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUploadPreview({
  onUpload,
  maxFiles = 10,
}: ImageUploadPreviewProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - images.length);

    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const id = Math.random().toString(36).substr(2, 9);
          setImages((prev) => [
            ...prev,
            {
              file,
              preview: e.target?.result as string,
              progress: 100,
              id,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    const files_to_upload = newFiles.filter((f) => f.type.startsWith('image/'));
    onUpload(files_to_upload);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        <p className="text-white font-semibold mb-1">اسحب الصور هنا أو انقر للاختيار</p>
        <p className="text-gray-400 text-sm">
          PNG, JPG, GIF حتى {maxFiles} صور ({(maxFiles - images.length)} متبقية)
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-white font-semibold mb-3 text-sm">الصور المختارة</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-full h-24 object-cover rounded-lg border border-gray-700"
                />

                {/* Progress Bar */}
                {img.progress < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Progress Indicator */}
                {img.progress < 100 && (
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {images.length}/{maxFiles} صورة
          </p>
        </div>
      )}
    </div>
  );
}
