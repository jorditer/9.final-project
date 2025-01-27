// useProfileImage.ts
import { useState } from 'react';
import { supabase } from '../config/supabase.config';
import { useProfileImages } from '../context/ProfileImagesContext';

export const useProfileImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { invalidateCache, updateCache } = useProfileImages();

  const uploadProfileImage = async (file: File, username: string) => {
    setIsUploading(true);
    try {
      // Prepare the new filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${username}.${fileExt}`;
      
      // Invalidate cache before upload
      invalidateCache(username);

      // Upload new file with upsert
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(`avatars/${fileName}`, file, {
          upsert: true  // This will automatically replace any existing file
        });

      if (uploadError) throw uploadError;

      // Get the public URL immediately after successful upload
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`avatars/${fileName}`);

      // Add cache-busting parameter
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
      // Update cache with new URL
      updateCache(username, urlWithTimestamp);
      
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadProfileImage, isUploading };
};