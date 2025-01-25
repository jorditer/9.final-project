import { useState } from "react";
import Pin from "../interfaces/Pin";

export const useEventForm = (initialData: Pin) => {
  const initDate = new Date().toISOString().split("T")[0] + "T17:00";

  const [formData, setFormData] = useState({
    date: initialData.date || initDate,
    title: initialData.title || "",
    place: initialData.location || "",
    description: initialData.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      return { success: true, data: formData };
    } catch (error) {
      return { success: false, error };
    }
  };

  const resetForm = () => {
    setFormData({
      date: initDate,
      title: "",
      place: "",
      description: "",
    });
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
