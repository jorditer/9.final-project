import React from "react";
import { Calendar, Clock, Timer } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// First style: Visual timeline with icon and colored urgency indicator
const Time = ({ date }) => {
  const now = new Date();
  // const diffInHours = (new Date(date) - now) / (1000 * 60 * 60);

  // Determine urgency color based on how soon the event is

  return (
    <>
      <div className="flex items-center space-x-2 pt-2 rounded-lg ">
        <Calendar className="w-5 h-5 text-gray-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{format(new Date(date), "EEEE, MMMM d")}</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 underline">{format(new Date(date), "h:mm a")}</span>
            <em className="text-xs ms-2 text-gray-500 no-underline">
            ({/* &nbsp; */}{formatDistanceToNow(new Date(date), { addSuffix: true })}
            )</em>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-2 pb-0 rounded-lg">
        {/* <Clock className="w-5 h-5 text-gray-600" /> */}
        <span className="text-xs text-gray-600 italic text-center"></span>
      </div>
    </>
  );
};

export default Time;
