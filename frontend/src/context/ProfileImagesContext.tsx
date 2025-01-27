import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../config/supabase.config';

type ProfileImagesContextType = {
  getImageUrl: (username: string) => Promise<string | null>;
  imageUrls: Record<string, string>;
};

const ProfileImagesContext = createContext<ProfileImagesContextType | null>(null);

export const ProfileImagesProvider = ({ children }: { children: ReactNode }) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const getImageUrl = async (username: string) => {
    // Return cached URL if exists
    if (imageUrls[username]) return imageUrls[username];
    
    try {
      const { data, error } = await supabase.storage
        .from('profiles')
        .list('avatars', { 
          search: username + '.',
          limit: 1
        });

      if (error) throw error;

      if (data?.[0]) {
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(`avatars/${data[0].name}`);
        
        setImageUrls(prev => ({ ...prev, [username]: publicUrl }));
        return publicUrl;
      }
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  return (
    <ProfileImagesContext.Provider value={{ getImageUrl, imageUrls }}>
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