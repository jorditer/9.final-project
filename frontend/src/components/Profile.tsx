import Connect from "./Connect";
import Pin from "../interfaces/Pin";
import UserInfo from "./UserInfo";
import EventCard from "./EventCard";
import { useFriendStatus } from "../hooks/useFriendStatus";
import { useEvents } from "../hooks/useEvents";

interface ProfileProps {
  showProfile: boolean;
  thisUser: string | null;
  eventsUser: string | null;
  pins: Pin[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  setCurrentPlaceId: (id: string | null) => void;
  onFriendshipChange: () => void;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;

}

const Profile: React.FC<ProfileProps> = ({
  onFriendshipChange,
  showProfile,
  thisUser,
  eventsUser,
  pins,
  updatePinDate,
  setPins,
  setCurrentPlaceId,
}) => {
  const { friendStatus, setFriendStatus } = useFriendStatus(thisUser, eventsUser);
  const { handleDelete } = useEvents(pins, setPins, setCurrentPlaceId);
  const userEvents = pins.filter((pin) => pin.username === eventsUser);
  

  return (
    <div className="z-10 h-full">
      <div className="h-full p-4 flex flex-col md:flex-row gap-4">
        {/* Mobile header */}
        <div className="flex justify-between items-center md:hidden">
          <h1>{thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}</h1>
          <UserInfo
            isMobile={true}
            thisUser={thisUser}
            eventsUser={eventsUser}
            onFriendshipChange={onFriendshipChange}
            friendStatus={friendStatus}
            setFriendStatus={setFriendStatus}
          />
        </div>
  
        {/* Desktop profile */}
        <div className="hidden md:flex md:flex-col items-center gap-2">
          <UserInfo
            thisUser={thisUser}
            eventsUser={eventsUser}
            onFriendshipChange={onFriendshipChange}
            friendStatus={friendStatus}
            setFriendStatus={setFriendStatus}
          />
          <span className="font-semibold text-center text-3xl -mb-2">{eventsUser || thisUser}</span>
          {thisUser && eventsUser && thisUser !== eventsUser && (
            <Connect 
              onFriendshipChange={onFriendshipChange} 
              thisUser={thisUser} 
              eventsUser={eventsUser}
              friendStatus={friendStatus}
              setFriendStatus={setFriendStatus}
            />
          )}
        </div>
  
        {/* Events Section */}
        <div className="flex-1 overflow-y-auto pr-2 items-center">
          {/* Desktop title */}
          <h1 className="hidden md:block mb-3 top-0 bg-white py-2">
            {thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}
          </h1>
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
              <p className="text-gray-500 text-center">No events created yet :(</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;