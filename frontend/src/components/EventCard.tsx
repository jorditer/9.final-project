// components/EventCard.tsx
import { Trash2 } from "lucide-react";
import Time from "./Time";
import Pin from "../interfaces/Pin";
interface EventCardProps {
  event: Pin;
  thisUser: string | null;
  onDelete: (pinId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, thisUser, onDelete }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg relative group">
      {thisUser === event.username && (
        <button
          onClick={() => onDelete(event._id)}
          className="absolute right-2 top-2 p-1.5 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete event"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}
      {/* Event Content */}
      <div className="flex flex-col space-y-2">
        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-[1.5fr,2fr,160px] lg:grid-cols-[1.5fr,2fr,1fr] items-center">
          <div>
            <h4
              className="text-lg font-semibold"
            >
              {event.title}
            </h4>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
          <div className="w-full">
            <Time date={event.date} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="grid grid-cols-[2fr,1fr] gap-4 md:hidden">
          <div className="flex flex-col min-w-0">
            <h4
              className={`text-lg font-semibold ${
                thisUser !== event.username ? "cursor-pointer hover:text-blue-600" : ""
              }`}
            >
              {event.title}
            </h4>
            <p className="text-sm text-gray-600 truncate">{event.location}</p>
            <p className="text-sm text-gray-700 line-clamp-2 mt-1">{event.description}</p>
          </div>
          <div className="self-center justify-self-start flex items-center justify-end truncate">
            <div className="overflow-hidden text-ellipsis">
              <Time date={event.date} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;