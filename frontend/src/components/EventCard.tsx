import { useState } from "react";
import { Trash2 } from "lucide-react";
import Time from "./Time";
import Pin from "../interfaces/Pin";
import DeleteConfirm from "./DeleteConfirm";
interface EventCardProps {
  event: Pin;
  thisUser: string | null;
  onDelete: (pinId: string) => void;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
}

const EventCard: React.FC<EventCardProps> = ({ event, thisUser, onDelete, updatePinDate }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  return (
    // Parent div gets 'group' class to enable hover effects on children
    // The hover:shadow-md gives subtle feedback when hovering over the card
<div className="group bg-secondary p-4 rounded-lg relative border-2 border-dark hover:shadow-md transition-all">
      {/* Delete button with confirmation - only shows for events owned by current user */}
      {thisUser === event.username && (
  <div className="absolute -right-0.5 -top-0.5">
    <button
      onClick={() => setShowDeleteConfirm(event._id)}
      className="p-1.5 rounded-full hover:bg-hoverDelete transition-colors opacity-0 group-hover:opacity-100"
      title="Delete event"
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
    {showDeleteConfirm === event._id && (
      <DeleteConfirm
        id={event._id}
        showConfirm={showDeleteConfirm}
        setShowConfirm={setShowDeleteConfirm}
        onDelete={onDelete}
      />
    )}
  </div>
)}
  
      {/* Event Content Container */}
      <div className="flex flex-col space-y-2">
        {/* Desktop layout - hidden on mobile, shows on md screens and up */}
        <div className="hidden md:grid md:grid-cols-[1.5fr,2fr,160px] lg:grid-cols-[1.5fr,2fr,180px] items-center">
        <div>
            <h4 className="text-lg font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
          <p className="text-sm text-gray-700 line-clam">{event.description}</p>
          <div className="w-full">
            <Time
              pin={event}
              isOwner={event.username === thisUser}
              updatePinDate={updatePinDate}
            />
          </div>
        </div>
  
        {/* Mobile layout - shows on mobile, hidden on md screens and up */}
        <div className="grid grid-cols-[2fr,1fr] gap-4 md:hidden">
          <div className="flex flex-col min-w-0">
            <h4
              className={`text-lg font-semibold $`}
            >
              {event.title}
            </h4>
            <p className="text-sm text-gray-600 truncate">{event.location}</p>
            <p className="text-sm text-gray-700 line-clamp-2 mt-1">{event.description}</p>
          </div>
          <div className="self-center justify-self-start flex items-center justify-end truncate">
            <div className="overflow-hidden text-ellipsis">
              <Time
                pin={event}
                isOwner={event.username === thisUser}
                updatePinDate={updatePinDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
