import { useState } from 'react';
import { supabase } from '../config/supabase.config';

export const useProfileImage = () => {
 const [isUploading, setIsUploading] = useState(false);

 const uploadProfileImage = async (file: File, username: string) => {
   setIsUploading(true);
   try {
     // Delete any existing files for this user
     const { data: existingFiles } = await supabase.storage
       .from('profiles')
       .list('avatars', {
         search: username
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

     // Upload new file
     const fileExt = file.name.split('.').pop();
     const fileName = `${username}.${fileExt}`;

     const { error } = await supabase.storage
       .from('profiles')
       .upload(`avatars/${fileName}`, file, {
         upsert: true
       });

     if (error) throw error;

   } catch (error) {
     console.error('Error uploading image:', error);
     throw error;
   } finally {
     setIsUploading(false);
   }
 };

 return { uploadProfileImage, isUploading };
};