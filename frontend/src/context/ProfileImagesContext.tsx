import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

type ProfileImagesContextType = {
  getImageUrl: (username: string) => Promise<string | null>;
  imageUrls: Record<string, string>;
  prefetchImages: (usernames: string[]) => Promise<void>;
  invalidateCache: (username: string) => void;
  updateCache: (username: string, url: string) => void;
};

const CACHE_KEY = 'profile_image_urls';

const ProfileImagesContext = createContext<ProfileImagesContextType | null>(null);

export const ProfileImagesProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available
  const [imageUrls, setImageUrls] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  });

  // Update localStorage when imageUrls changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(imageUrls));
  }, [imageUrls]);

  const invalidateCache = (username: string) => {
    setImageUrls(prev => {
      const newCache = { ...prev };
      delete newCache[username];
      return newCache;
    });
  };

  const updateCache = (username: string, url: string) => {
    setImageUrls(prev => ({
      ...prev,
      [username]: url
    }));
  };

  const getImageUrl = async (username: string) => {
    // Return cached URL if exists
    if (imageUrls[username]) {
      return imageUrls[username];
    }
    
    try {
      // Get the public URL directly, assuming jpg extension
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`avatars/${username}.jpg`);
      
      // Add timestamp for cache busting
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
  
      // Check if the image actually exists with a HEAD request
      const response = await fetch(urlWithTimestamp, { method: 'HEAD' });
      
      if (response.ok) {
        updateCache(username, urlWithTimestamp);
        return urlWithTimestamp;
      }
      
      // If image doesn't exist, cache empty result
      updateCache(username, '');
      return null;
  
    } catch (error) {
      console.error('Error fetching image:', error);
      updateCache(username, '');
      return null;
    }
  };

  const prefetchImages = async (usernames: string[]) => {
    const uncachedUsernames = usernames.filter(username => !imageUrls[username]);
    if (uncachedUsernames.length === 0) return;
  
    for (const username of uncachedUsernames) {
      await getImageUrl(username);
    }
  };

  return (
    <ProfileImagesContext.Provider value={{ 
      getImageUrl, 
      imageUrls, 
      prefetchImages,
      invalidateCache,
      updateCache 
    }}>
      {children}
    </ProfileImagesContext.Provider>
  );
};

export const useProfileImages = () => {
  const context = useContext(ProfileImagesContext);
  if (!context) {
    throw new Error('useProfileImages must be used within a ProfileImagesProvider');
  }
  return context;
};