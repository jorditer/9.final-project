// import Datetime from "react-datetime";
// import "react-datetime/css/react-datetime.css";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import Datepicker from "react-datepicker";

const Form = () => {
  const initDate = new Date().toISOString().split("T")[0] + "T17:00"; //for datetime-local
  // const initDate = new Date();
  const [selectedDate, setSelectedDate] = useState(initDate);
  return (
    <div className="text-base -my-1 flex justify-end flex-col">
      <form action="">
        <label className="">Date</label>
        {/* <Datepicker showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" selected={selectedDate} onChange={(date) => setSelectedDate(date)} /> */}
        <input
          className=""
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          name=""
          id=""
        />
        <label className="">Title</label>
        <input type="text" name="" id="" />
        <label className="">Place</label>
        <input type="text" name="" id="" />
        <label>Description</label>
        <textarea name="" placeholder="What is the plan?" id=""></textarea>
      </form>
    </div>
  );
};

export default Form;
