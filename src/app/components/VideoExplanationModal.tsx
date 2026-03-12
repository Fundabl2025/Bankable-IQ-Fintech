import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { type ThemeColor, getThemeGradient } from './ThemeButton';

interface VideoExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  theme?: ThemeColor;
}

export function VideoExplanationModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  theme = 'blue-cyan'
}: VideoExplanationModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const gradientClass = getThemeGradient(theme);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 ${gradientClass} opacity-20 rounded-2xl`} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="Close video"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video Container */}
        <div className="relative p-1">
          <div className="bg-black rounded-xl overflow-hidden">
            {title && (
              <div className={`px-6 py-4 ${gradientClass} bg-opacity-90`}>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black"
              controls
              controlsList="nodownload"
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
