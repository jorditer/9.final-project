import { useState } from 'react';
import { supabase } from '../config/supabase.config';
import { useProfileImages } from '../context/ProfileImagesContext';

export const useProfileImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { invalidateCache, updateCache } = useProfileImages();

  const deleteExistingImages = async (username: string) => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('profiles')
        .list('avatars');

      if (listError) throw listError;

      const userFiles = files?.filter(file => 
        file.name.startsWith(`${username}.`)
      );
      
      if (userFiles && userFiles.length > 0) {
        const filePaths = userFiles.map(file => `avatars/${file.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove(filePaths);

        if (deleteError) throw deleteError;
      }
    } catch (err) {
      console.error('Error deleting existing images:', err);
      throw err;
    }
  };

  const uploadProfileImage = async (file: File, username: string) => {
    setIsUploading(true);
    try {
      invalidateCache(username);

      await deleteExistingImages(username);

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${username}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(`avatars/${fileName}`, file, {
          upsert: false  // We don't need upsert since we manually deleted old files
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`avatars/${fileName}`);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
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