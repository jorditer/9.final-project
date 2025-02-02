import axios from 'axios';
import api from '../services/api';
import Pin from '../interfaces/Pin';

export const useEventAssistant = (setPins: React.Dispatch<React.SetStateAction<Pin[]>>) => {
  const toggleAssistant = async (pin: Pin, username: string) => {
    // Prevent if user is event owner
    if (pin.username === username) return;

    try {
      const isAlreadyAssistant = pin.assistants.includes(username);
      
      if (isAlreadyAssistant) {
        await api.delete(`/pins/${pin._id}/assistants/${username}`);
      } else {
        await api.post(`/pins/${pin._id}/assistants/${username}`);
      }

      // Update local state
      setPins(prevPins => prevPins.map(p => {
        if (p._id === pin._id) {
          return {
            ...p,
            assistants: isAlreadyAssistant 
              ? p.assistants.filter(a => a !== username)
              : [...p.assistants, username]
          };
        }
        return p;
      }));

    } catch (error) {
      console.error('Error toggling assistant status:', error);
    }
  };

  return { toggleAssistant };
};