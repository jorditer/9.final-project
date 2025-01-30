// hooks/useEvents.ts
import axios from "axios";
import Pin from "../interfaces/Pin";

export const useEvents = (
  pins: Pin[], 
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>,
  setCurrentPlaceId: (id: string | null) => void
) => {
  const handleDelete = async (pinId: string) => {
    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter((pin) => pin._id !== pinId));
      setCurrentPlaceId(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const updatePinDate = async (pinId: string, date: Date) => {
    try {
      const response = await axios.patch(`/api/pins/${pinId}/date`, { date });
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