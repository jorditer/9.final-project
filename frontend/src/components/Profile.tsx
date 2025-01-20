import React from "react";
import Pin from "../interfaces/Pin";
import Time from "./Time";
import { Trash2 } from "lucide-react";
import axios from "axios";

interface ProfileProps {
  showProfile: boolean;
  thisUser: string | null;
  eventsUser: string | null;
  pins: Pin[];
  setPins: (pins: Pin[]) => void;
  setCurrentPlaceId: (id: string | null) => void;
}

const Profile: React.FC<ProfileProps> = ({ showProfile, thisUser, eventsUser, pins, setPins, setCurrentPlaceId }) => {
  const userEvents = pins.filter((pin) => pin.username === eventsUser);
  
  const handleDelete = async (pinId: string) => {
    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter((pin) => pin._id !== pinId));
      setCurrentPlaceId(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <div
      className={`z-10 fixed mx-2 bottom-2 w-[calc(100%-1rem)] h-1/3 bg-white transition-all duration-700 ease-in-out transform ${
        showProfile ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      } overflow-hidden rounded-t-lg`}
    >
      <div className="h-full p-4 flex flex-col md:flex-row gap-4">
        {/* Header section with title and profile on mobile */}
        <div className="flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold">
            {thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg">{eventsUser || thisUser}</span>
            <div className="size-12 bg-black rounded-full" />
          </div>
        </div>

        {/* Profile Section - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex md:flex-col items-center md:w-1/5 gap-2">
          <div className="size-40 lg:size-48 bg-black rounded-full" />
          <span className="font-semibold text-center text-3xl">{eventsUser || thisUser}</span>
        </div>

        {/* Events Section */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Desktop title */}
          <h1 className="hidden md:block mb-3 top-0 bg-white py-2 text-xl font-bold">
            {thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}
          </h1>
          <div className="flex flex-col gap-3">
            {userEvents.map((event) => (
              <div key={event._id} className="bg-gray-50 p-4 rounded-lg relative group">
                {thisUser === eventsUser && (
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="absolute right-2 top-2 p-1.5 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
                {/* Event Content */}
                <div className="grid grid-cols-5 gap-6">
                  {/* Title and Location */}
                  <div className="col-span-2 min-w-0">
                    <h4 className="text-lg font-semibold truncate pr-8">{event.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{event.location}</p>
                  </div>
                  {/* Description */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                  </div>
                  {/* Time with truncation */}
                  <div className="col-span-1 flex items-start justify-end min-w-0">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap w-full text-right">
                      <Time date={event.date} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {userEvents.length === 0 && (
              <p className="text-gray-500 text-center">No events created yet :(</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;