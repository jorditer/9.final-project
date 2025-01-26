import { useState, FormEvent } from "react";
import createChangeHandler from "../utils/form";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

interface FormProps {
  coordinates: { 
    lat: number;
    long: number;
  };
  onSuccess: (data: any) => void;
  thisUser: string | null;
}

const Form = ({ coordinates: {lat, long}, onSuccess, thisUser }: FormProps) => {
  const initDate = new Date().toISOString().split("T")[0] + "T17:00";
  const [eventData, setEventData] = useState({
    date: initDate,
    title: "",
    location: "",
    description: "",
  });

  const handleChange = createChangeHandler(setEventData);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!thisUser) {
        console.error('No user logged in');
        return;
      }

      const res = await axios.post("/api/pins", {
        ...eventData,
        lat,
        long,
        username: thisUser,
      });

      onSuccess(res.data.data);
      setEventData({
        date: initDate,
        title: "",
        location: "",
        description: "",
      });
    } catch(err) {
      console.error('Error creating event:', err);
    }
  };

  const now = new Date();
  const formattedDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="text-base -my-1 flex justify-end flex-col">
      <form onSubmit={handleSubmit}>
        <label className="">Date</label>
        <input
          className="py-[2px]"
          min={formattedDateTime}
          type="datetime-local"
          title="Please select a future date"
          value={eventData.date}
          onChange={handleChange}
          name="date"
        />
        <label htmlFor="title" className="">Title</label>
        <input 
          className="py-[2px]" 
          name="title" 
          id="title" 
          type="text" 
          onChange={handleChange} 
          maxLength={22} 
          required 
        />
        <label htmlFor="location" className="">Location</label>
        <input 
          className="py-[2px]" 
          name="location" 
          id="location" 
          type="text" 
          onChange={handleChange} 
          maxLength={20} 
          required 
        />
        <label htmlFor="description">Description</label>
        <textarea
          name="description" 
          id="description"
          placeholder="What is the plan?"
          maxLength={60}
          onChange={handleChange} 
          className="max-h-20"
        ></textarea>
        <input className="cursor-pointer" type="submit" value="Create Event" />
      </form>

    </div>
  );
};

export default Form;