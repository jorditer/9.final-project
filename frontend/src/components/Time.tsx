import { Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TimeProps {
  date: Date;
}

const Time: React.FC<TimeProps> = ({ date }) => {
  // This helper function removes the word "about" from the formatted distance
  const formatTimeDistance = (date: Date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true });
    // The "about" looks pretty ugly and makes it hard to be responsive
    return distance.replace(/about /, '');
  };

  return (
    <div className="flex items-center space-x-2 rounded-lg w-full">
      <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate">
          <span className="hidden sm:inline">{format(new Date(date), "EEEE, ")}</span>
          {format(new Date(date), "MMMM d")}
        </span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-600 underline flex-shrink-0">
            {format(new Date(date), "h:mm a")}
          </span>
          <em className="text-gray-500 hidden text-nowrap sm:inline">
            ({formatTimeDistance(date)})
          </em>
        </div>
      </div>
    </div>
  );
};

export default Time;