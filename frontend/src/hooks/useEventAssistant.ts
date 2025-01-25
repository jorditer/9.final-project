import axios from 'axios';
import Pin from '../interfaces/Pin';

export const useEventAssistant = (setPins: React.Dispatch<React.SetStateAction<Pin[]>>) => {
  const addAssistant = async (pin: Pin, username: string) => {
    // Don't allow if user is the creator
    if (pin.username === username) return;
    
    try {
      await axios.post(`/api/pins/${pin._id}/assistants/${username}`);
      
      // Update the local pins state to include the new assistant
      setPins(prevPins => prevPins.map(p => {
        if (p._id === pin._id) {
          return {
            ...p,
            assistants: [...p.assistants, username]
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error adding assistant:', error);
    }
  };

  return { addAssistant };
};