import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

export const useProfileImageUrl = (username: string | null, refresh?: number) => {
 const [imageUrl, setImageUrl] = useState<string | null>(null);

 useEffect(() => {
   const fetchImage = async () => {
     if (!username) return;

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
         setImageUrl(publicUrl);
		 console.log(data[0].name);
		 console.log('Public URL:', publicUrl);
       }
     } catch (error) {
       console.error('Error fetching profile image:', error);
       setImageUrl(null);
     }
   };

   fetchImage();
 }, [username, refresh]);

 return imageUrl;
};