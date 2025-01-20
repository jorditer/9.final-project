import React from "react";
import { Calendar, Clock, Timer } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TimeProps {
  date: Date;
}

const Time: React.FC<TimeProps> = ({ date }) => {
  return (
    <div className="flex items-center space-x-2 pt-2 rounded-lg">
      <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">
          {format(new Date(date), "EEEE, MMMM d")}
        </span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-600 underline flex-shrink-0">
            {format(new Date(date), "h:mm a")}
          </span>
          <em className="text-gray-500 truncate">
            ({formatDistanceToNow(new Date(date), { addSuffix: true })})
          </em>
        </div>
      </div>
    </div>
  );
};


export default Time;
