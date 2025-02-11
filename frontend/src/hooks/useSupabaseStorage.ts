import { useState } from 'react';
import { supabase } from '../config/supabase.config';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteExistingImages = async (fileName: string) => {
    try {
      const baseName = fileName.split('.')[0];
      console.log('Searching for files with base name:', baseName);
      
      // List all files in the avatars folder
      const { data: files, error: listError } = await supabase.storage
        .from('profiles')
        .list('avatars');

      console.log('All files in storage:', files);

      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
      }

      // Find any files that start with the base name followed by a dot
      const filesToDelete = files?.filter(file => 
        file.name.startsWith(`${baseName}.`)
      );
      
      console.log('Files matching pattern to delete:', filesToDelete);
      
      if (filesToDelete && filesToDelete.length > 0) {
        const filePaths = filesToDelete.map(file => `avatars/${file.name}`);
        console.log('Attempting to delete files with paths:', filePaths);
        
        const { error: deleteError, data: deleteData } = await supabase.storage
          .from('profiles')
          .remove(filePaths);

        console.log('Delete operation result:', deleteError ? 'Error' : 'Success');
        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }
        console.log('Delete operation data:', deleteData);
      } else {
        console.log('No existing files found to delete');
      }
    } catch (err) {
      console.error('Error in deleteExistingImages:', err);
      throw err;
    }
  };

  const uploadImage = async (file: File, username: string) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('Starting upload for file:', file.name, 'username:', username);
      
      // Get the file extension
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${username}.${fileExt}`;
      console.log('Generated fileName:', fileName);

      // Delete any existing files with the same base name
      await deleteExistingImages(fileName);

      // Upload the new file
      console.log('Attempting to upload to path:', `avatars/${fileName}`);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profiles')
        .upload(`avatars/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`avatars/${fileName}`);

      console.log('Generated public URL:', publicUrl);

      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('Error in uploadImage:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error
  };
};