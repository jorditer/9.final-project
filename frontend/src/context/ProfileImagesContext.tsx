// ProfileImagesContext.tsx
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
    // Return cached URL if exists (no expiration)
    if (imageUrls[username]) {
      return imageUrls[username];
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('profiles')
        .list('avatars', { 
          search: username + '.',
          limit: 1,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      if (error) throw error;

      if (data?.[0]) {
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(`avatars/${data[0].name}`);
        
        // Still add timestamp to prevent browser caching when image updates
        const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
        updateCache(username, urlWithTimestamp);
        return urlWithTimestamp;
      }
      
      // Cache the fact that user has no image to prevent repeated lookups
      updateCache(username, '');
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const prefetchImages = async (usernames: string[]) => {
    // Remove empty usernames and already cached ones
    const newUsernames = usernames.filter(username => 
      username && !imageUrls[username]
    );
    
    if (newUsernames.length === 0) return;

    // Fetch all images in parallel
    await Promise.all(
      newUsernames.map(username => getImageUrl(username))
    );
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