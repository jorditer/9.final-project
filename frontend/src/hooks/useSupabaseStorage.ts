import { useState } from 'react';
import { supabase } from '../config/supabase.config';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteExistingImages = async (fileName: string) => {
    try {
      const baseName = fileName.split('.')[0];
      
      const { data: files, error: listError } = await supabase.storage
        .from('profiles')
        .list('avatars');


      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
      }

      const filesToDelete = files?.filter(file => 
        file.name.startsWith(`${baseName}.`)
      );
      
      
      if (filesToDelete && filesToDelete.length > 0) {
        const filePaths = filesToDelete.map(file => `avatars/${file.name}`);
        
        const { error: deleteError, data: deleteData } = await supabase.storage
          .from('profiles')
          .remove(filePaths);

        console.log('Delete operation result:', deleteError ? 'Error' : 'Success');
        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }
      } else {
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
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${username}.${fileExt}`;
      console.log('Generated fileName:', fileName);

      await deleteExistingImages(fileName);

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