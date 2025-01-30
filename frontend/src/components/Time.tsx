import { useState } from "react";
import { Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useEvents } from "../hooks/useEvents";
import Pin from "../interfaces/Pin";

interface TimeProps {
  date: Date;
  pinId: string;
  isOwner: boolean;
  pins: Pin[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  setCurrentPlaceId: (id: string | null) => void;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
}

const Time: React.FC<TimeProps> = ({ 
  date, 
  pinId, 
  isOwner,
  updatePinDate
}) => {
  const [isEditing, setIsEditing] = useState(false);
// const { updatePinDate } = useEvents(pins, setPins, setCurrentPlaceId);
  
  // Format date for input value
  const formatForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  // This helper function removes the word "about" from the formatted distance
  const formatTimeDistance = (date: Date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true });
    return distance.replace(/about /, '');
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await updatePinDate(pinId, new Date(e.target.value));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update date:", err);
    }
  };
  

  return (
    <div className="flex items-center space-x-2 rounded-lg w-full">
      <Calendar 
        className={`w-5 h-5 text-gray-600 flex-shrink-0 ${isOwner ? 'cursor-pointer hover:text-blue-500' : ''}`} 
        onClick={() => isOwner && setIsEditing(!isEditing)}
      />
      {isEditing ? (
        <input
          type="datetime-local"
          className="text-sm p-1 border rounded"
          value={formatForInput(new Date(date))}
          min={formatForInput(new Date())}
          onChange={handleDateChange}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
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
      )}
    </div>
  );
};

export default Time;