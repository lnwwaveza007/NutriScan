import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ScanButtonProps {
  onImageSelect: (base64: string) => void;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment" // Forces camera on mobile
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2 pr-6 pl-5 z-50 group"
      >
        <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-lg">Scan Food</span>
      </button>
    </>
  );
};
