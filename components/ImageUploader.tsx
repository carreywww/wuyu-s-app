import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile | null) => void;
  selectedImage: ImageFile | null;
  labels?: {
    drop: string;
    click: string;
    support: string;
    original: string;
  };
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  selectedImage,
  labels = {
    drop: 'Drop it here',
    click: 'Click or drop image',
    support: 'Supports JPG, PNG, WEBP up to 10MB',
    original: 'Original'
  }
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Split metadata from base64 string for API usage
      const base64 = result.split(',')[1];
      
      onImageSelected({
        file,
        previewUrl: result,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-64 md:h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <img 
          src={selectedImage.previewUrl} 
          alt="Original Upload" 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={handleRemove}
            className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
          {labels.original}
        </div>
      </div>
    );
  }

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative w-full h-64 md:h-96 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
      />
      
      <div className="flex flex-col items-center space-y-4 p-6 text-center">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
        `}>
          {isDragging ? <Upload className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? labels.drop : labels.click}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {labels.support}
          </p>
        </div>
      </div>
    </div>
  );
};