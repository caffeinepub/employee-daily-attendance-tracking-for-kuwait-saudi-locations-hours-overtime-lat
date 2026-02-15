import React, { useState, useEffect } from 'react';
import { ExternalBlob } from '../../backend';
import { User } from 'lucide-react';

interface EmployeePhotoThumbnailProps {
  photo: ExternalBlob;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmployeePhotoThumbnail({ photo, name, size = 'md' }: EmployeePhotoThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const url = photo.getDirectURL();
      setImageUrl(url);
    } catch (err) {
      console.error('Failed to get photo URL:', err);
      setError(true);
    }
  }, [photo]);

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-32 w-32',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };

  if (error || !imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center flex-shrink-0`}
        title={name}
      >
        <User className={`${iconSizes[size]} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-muted flex-shrink-0`} title={name}>
      <img src={imageUrl} alt={name} className="h-full w-full object-cover" onError={() => setError(true)} />
    </div>
  );
}
