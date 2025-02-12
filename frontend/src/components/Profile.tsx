import Connect from "./Connect";
import { useMemo } from "react";
import Pin from "../interfaces/Pin";
import UserInfo from "./UserInfo";
import EventCard from "./EventCard";
import { useFriendStatus } from "../hooks/useFriendStatus";
import { useEvents } from "../hooks/useEvents";

interface ProfileProps {
  eventsUser: string | null;
  thisUser: string | null;
  pins: Pin[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
}

const Profile: React.FC<ProfileProps> = ({ thisUser, eventsUser, pins, updatePinDate, setPins }) => {
  const { friendStatus, setFriendStatus } = useFriendStatus(thisUser, eventsUser);
  const { handleDelete } = useEvents(pins, setPins, thisUser);
  const userEvents = useMemo(() => {
    const canSeeEvents = thisUser === eventsUser || friendStatus === "connected";
    return canSeeEvents ? pins.filter((pin) => pin.username === eventsUser) : [];
  }, [pins, eventsUser, thisUser, friendStatus]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        {/* Mobile header */}
        <div className="flex justify-between items-center md:hidden p-4">
          <h1 className="bg-dark">{thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}</h1>
          <UserInfo
            isMobile={true}
            thisUser={thisUser}
            eventsUser={eventsUser}
            onFriendshipChange={() => {}}
            friendStatus={friendStatus}
            setFriendStatus={setFriendStatus}
          />
        </div>

        {/* Desktop profile */}
        <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0 items-center gap-2 p-4 border-r border-gray-200">
          <UserInfo
            thisUser={thisUser}
            eventsUser={eventsUser}
            onFriendshipChange={() => {}}
            friendStatus={friendStatus}
            setFriendStatus={setFriendStatus}
          />
          <span className="font-semibold text-center text-3xl mb-0.5">{eventsUser || thisUser}</span>
          {thisUser && eventsUser && thisUser !== eventsUser && (
            <Connect
              onFriendshipChange={() => {}}
              thisUser={thisUser}
              eventsUser={eventsUser}
              friendStatus={friendStatus}
              setFriendStatus={setFriendStatus}
            />
          )}
        </div>

        {/* Events Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop title */}
          <h1 className="hidden md:block p-4 bg-dark border-b border-gray-200">
            {thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}
          </h1>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {userEvents.map((event) => (
                <EventCard
                  key={event._id}
                  updatePinDate={updatePinDate}
                  event={event}
                  thisUser={thisUser}
                  onDelete={handleDelete}
                />
              ))}
              {userEvents.length === 0 && (
                <p className="text-gray-500 text-center">
                  {thisUser === eventsUser || friendStatus === "connected"
                    ? "No events created yet :("
                    : "You can't see the events if you are not connected!"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
