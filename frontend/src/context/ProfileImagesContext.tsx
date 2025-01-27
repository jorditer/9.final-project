import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../config/supabase.config';

type ProfileImagesContextType = {
  getImageUrl: (username: string) => Promise<string | null>;
  imageUrls: Record<string, string>;
  prefetchImages: (usernames: string[]) => Promise<void>;
  invalidateCache: (username: string) => void;
  updateCache: (username: string, url: string) => void;
};

const ProfileImagesContext = createContext<ProfileImagesContextType | null>(null);

export const useProfileImages = () => {
  const context = useContext(ProfileImagesContext);
  if (!context) {
    throw new Error('useProfileImages must be used within a ProfileImagesProvider');
  }
  return context;
};

export const ProfileImagesProvider = ({ children }: { children: ReactNode }) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

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
    if (imageUrls[username]) return imageUrls[username];
    
    try {
      const { data, error } = await supabase.storage
        .from('profiles')
        .list('avatars', { 
          search: username + '.',
          limit: 1,
          sortBy: { column: 'updated_at', order: 'desc' }  // Get most recent file
        });

      if (error) throw error;

      if (data?.[0]) {
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(`avatars/${data[0].name}`);
        
        // Add cache-busting parameter to prevent browser caching
        const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
        updateCache(username, urlWithTimestamp);
        return urlWithTimestamp;
      }
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const prefetchImages = async (usernames: string[]) => {
    const newUsernames = usernames.filter(username => !imageUrls[username]);
    
    if (newUsernames.length === 0) return;

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