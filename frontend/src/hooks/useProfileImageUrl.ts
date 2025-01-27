import { useState, useEffect } from 'react';
import { useProfileImages } from '../context/ProfileImagesContext';

export const useProfileImageUrl = (username: string | null) => {
  const { getImageUrl, imageUrls } = useProfileImages();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    // If we already have the URL in cache, use it immediately
    if (imageUrls[username]) {
      setImageUrl(imageUrls[username]);
      return;
    }

    // Otherwise fetch it
    getImageUrl(username).then(url => {
      setImageUrl(url);
    });
  }, [username, imageUrls]);

  return imageUrl;
};