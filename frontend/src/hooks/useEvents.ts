// hooks/useEvents.ts
import api from "../services/api";
import Pin from "../interfaces/Pin";

export const useEvents = (
  pins: Pin[], 
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>,
  setCurrentPlaceId: (id: string | null) => void
) => {
  const handleDelete = async (pinId: string) => {
    try {
      // Replace axios.delete with api.delete
      await api.delete(`/pins/${pinId}`);
      setPins(pins.filter((pin) => pin._id !== pinId));
      setCurrentPlaceId(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const updatePinDate = async (pinId: string, date: Date) => {
    try {
      // Replace axios.patch with api.patch
      const response = await api.patch(`/pins/${pinId}/date`, { date });
      setPins(prevPins => prevPins.map(pin => 
        pin._id === pinId ? response.data.data : pin
      ));
      return response.data.data;
    } catch (err) {
      console.error("Error updating event date:", err);
      throw err;
    }
  };

  return { handleDelete, updatePinDate };
};