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
      // Delete any existing files for this user
      const { data: existingFiles } = await supabase.storage
        .from('profiles')
        .list('avatars', {
          search: username,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (existingFiles?.length) {
        await Promise.all(
          existingFiles.map(file => 
            supabase.storage
              .from('profiles')
              .remove([`avatars/${file.name}`])
          )
        );
      }

      // Invalidate cache before upload
      invalidateCache(username);

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${username}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(`avatars/${fileName}`, file, {
          upsert: true
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