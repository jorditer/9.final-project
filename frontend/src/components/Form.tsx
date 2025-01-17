// import Datetime from "react-datetime";
// import "react-datetime/css/react-datetime.css";
import "react-datepicker/dist/react-datepicker.css";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios"

const Form = ({ coordinates: {lat, long}, onSuccess }: { coordinates: { lat:number , long: number }, onSuccess: (data: any) => void }) => {
  const initDate = new Date().toISOString().split("T")[0] + "T17:00"; //for datetime-local
  // console.log(coordinates.longitude);
  // console.log(coordinates.latitude);
  // const initDate = new Date();
  const [eventData, setEventData] = useState({
    date: initDate,
    title: "",
    location: "",
    description: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/pins", {...eventData, lat, long, username: "Jordi"});
      onSuccess(res.data.data);
      // setEventData(res.data)
      setEventData({
        date: initDate,
        title: "",
        location: "",
        description: "",
      });
    } catch(err) {
      console.log(err)
    }
  };
  return (
    <div className="text-base -my-1 flex justify-end flex-col">
      <form onSubmit={handleSubmit}>
        <label className="">Date</label>
        {/* <Datepicker showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" selected={selectedDate} onChange={(date) => setSelectedDate(date)} /> */}
        <input
          className=""
          type="datetime-local"
          value={eventData.date}
          onChange={handleChange}
          name="date"
        />
        <label className="">Title</label>
        <input name="title" type="text" onChange={handleChange} />
        <label className="">Location</label>
        <input name="location" type="text" onChange={handleChange} />
        <label>Description</label>
        <textarea
          name="description"
          placeholder="What is the plan?"
          onChange={handleChange}
        ></textarea>
        <input className="w-full cursor-pointer transition-all bg-blue-500 text-white px-6 py-1 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]" type="submit" value="Create Event" />
      </form>
    </div>
  );
};

export default Form;
