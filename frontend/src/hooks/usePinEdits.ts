import { useState } from 'react';
import api from '../services/api';
import Pin from '../interfaces/Pin';

type EditField = 'title' | 'location' | 'description';

export const usePinEdits = (pins: Pin[], setPins: React.Dispatch<React.SetStateAction<Pin[]>>) => {
  const [editingField, setEditingField] = useState<{[key in EditField]: string | null}>({
    title: null,
    location: null,
    description: null
  });

  const handleEdit = async (field: EditField, pinId: string, newValue: string) => {
    try {
      await api.patch(`/pins/${pinId}/${field}`, { [field]: newValue });
      setPins(pins.map((p) => (p._id === pinId ? { ...p, [field]: newValue } : p)));
      setEditingField(prev => ({ ...prev, [field]: null }));
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
    }
  };

  return {
    editingField,
    setEditingField,
    handleEdit
  };
};