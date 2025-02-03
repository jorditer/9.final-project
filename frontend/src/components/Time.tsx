import { useState, useRef } from "react";
import { Calendar, Pencil } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Pin from "../interfaces/Pin";

interface TimeProps {
  date: Date;
  pinId: string;
  isOwner: boolean;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
}

const Time: React.FC<TimeProps> = ({ date, pinId, isOwner, updatePinDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  const formatTimeDistance = (date: Date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true });
    return distance.replace(/about /, '');
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setIsEditing(false);
      setPendingDate(null);
      return;
    }
    setPendingDate(new Date(e.target.value));
  };

  const handleConfirm = async () => {
    if (pendingDate) {
      try {
        await updatePinDate(pinId, pendingDate);
        setIsEditing(false);
        setPendingDate(null);
      } catch (err) {
        console.error("Failed to update date:", err);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPendingDate(null);
  };

  const handleIconClick = () => {
    if (isOwner) {
      setIsEditing(true);
      setTimeout(() => {
        const handleDocumentClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.datetime-picker-container')) {
            handleCancel();
            document.removeEventListener('click', handleDocumentClick);
          }
        };
        setTimeout(() => {
          document.addEventListener('click', handleDocumentClick);
        }, 100);
        inputRef.current?.showPicker();
      }, 0);
    }
  };

  return (
    <div className="flex items-center space-x-2 rounded-lg w-full datetime-picker-container relative">
      <div 
        className={`w-5 h-5 text-gray-600 flex-shrink-0 ${
          isOwner && 'cursor-pointer hover:text-blue-500'
        }`}
        onClick={handleIconClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isOwner && (isHovering || isEditing) ? <Pencil size={20} /> : <Calendar size={20} />}
      </div>
      
      <div className="flex flex-col min-w-0 flex-1">
        <span className={`text-sm font-medium truncate ${pendingDate ? '' : 'hidden sm:inline'}`}>
        <span className={`${pendingDate ? 'hidden' : 'hidden sm:inline'}` }>{format(new Date(pendingDate || date), "EEEE, ")}</span>
        {format(new Date(pendingDate || date), "MMMM d")}
        </span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-600 underline flex-shrink-0">
            {format(new Date(date), "h:mm a")}
          </span>
          <em className={`text-gray-500 text-nowrap ${pendingDate ? 'hidden' : 'hidden sm:inline'}`}>
            ({formatTimeDistance(date)})
          </em>
        </div>
      </div>
   
      {pendingDate && (
        <div className="absolute right-0 top-0 flex items-center space-x-2">
          <button 
            onClick={handleConfirm}
            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
            title="Confirm"
          >
            ✓
          </button>
          <button 
            onClick={handleCancel}
            className="px-1.5 rounded-xl text-red-600 hover:bg-red-50 text-lg"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}
   
      {isEditing && (
        <input
          ref={inputRef}
          type="datetime-local"
          className="hidden"
          value={formatForInput(pendingDate || date)}
          min={formatForInput(new Date())}
          onChange={handleDateChange}
          onBlur={(e) => {
            if (!e.relatedTarget?.closest('.datetime-picker-container')) {
              handleCancel();
            }
          }}
        />
      )}
    </div>
   );
};

export default Time;
