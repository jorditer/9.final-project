// hooks/useEvents.ts
import { useState } from 'react';
import axios from 'axios';
import Pin from '../interfaces/Pin';

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

  return { handleDelete };
};