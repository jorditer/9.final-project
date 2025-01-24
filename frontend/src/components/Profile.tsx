import Connect from "./Connect";
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
      className={`z-10 fixed mx-2 bottom-2 w-[calc(100%-1rem)] h-2/5 bg-white transition-all duration-700 ease-in-out transform ${
        showProfile ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      } overflow-hidden rounded-t-lg`}
    >
      <div className="h-full p-4 flex flex-col md:flex-row gap-4">
        {/* Header section with title and profile on mobile */}
        <div className="flex justify-between items-center md:hidden">
          <h1 className="">{thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}</h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg">{eventsUser || thisUser}</span>
            <div className="size-12 bg-black rounded-full min-h-10" />
            {thisUser && eventsUser && thisUser !== eventsUser && (
              <Connect thisUser={thisUser} eventsUser={eventsUser} />
            )}
          </div>
        </div>
        {/* Profile Section - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex md:flex-col items-center">
          <div className="size-40 -mt-1 aspect-square lg:size-42 bg-black rounded-full" />
          <span className="font-semibold text-center text-3xl ">{eventsUser || thisUser}</span>
          {thisUser && eventsUser && thisUser !== eventsUser && <Connect thisUser={thisUser} eventsUser={eventsUser} />}
        </div>
        {/* Events Section */}
        <div className="flex-1 overflow-y-auto pr-2 items-center">
          {/* Desktop title */}
          <h1 className="hidden md:block mb-3 top-0 bg-white py-2 ">
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
                <div className="flex flex-col space-y-2">
                  {/* Title always at top on mobile */}

                  {/* Desktop layout */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr,2fr,160px] lg:grid-cols-[1.5fr,2fr,1fr] items-center">
                    <div>
                      <h4 className="text-lg font-semibold truncate pr-8">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                    <div className="w-full ">
                      <Time date={event.date} />
                    </div>
                  </div>

                  {/* Mobile layout - two columns after title */}
                  <div className="grid grid-cols-[2fr,1fr] gap-4 md:hidden">
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-lg font-semibold truncate pr-8 md:hidden">{event.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{event.location}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mt-1">{event.description}</p>
                    </div>
                    <div className="self-center justify-self-start flex items-center justify-end truncate">
                      <div className="overflow-hidden text-ellipsis ">
                        <Time date={event.date} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {userEvents.length === 0 && <p className="text-gray-500 text-center">No events created yet :(</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
