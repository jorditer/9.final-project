// import Datetime from "react-datetime";
// import "react-datetime/css/react-datetime.css";
import createChangeHandler from "../utils/form";
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



  const handleChange = createChangeHandler(setEventData)

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
          className="py-[2px]"
          type="datetime-local"
          value={eventData.date}
          onChange={handleChange}
          name="date"
        />
        <label htmlFor="title" className="">Title</label>
        <input className="py-[2px]" name="title" id="title" type="text" onChange={handleChange} />
        <label htmlFor="location" className="">Location</label>
        <input className="py-[2px]" name="location" id="collection" type="text" onChange={handleChange} />
        <label htmlFor="description">Description</label>
        <textarea
          name="description" id="description"
          placeholder="What is the plan?"
          onChange={handleChange}
        ></textarea>
        <input className="" type="submit" value="Log in" />
      </form>
    </div>
  );
};

export default Form;
