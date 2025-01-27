import { useState, useEffect } from "react";
import { useProfileImage } from "../hooks/useProfileImage";
import noImage from "../assets/imgs/no-image.jpg";
import Connect from "./Connect";
import Pin from "../interfaces/Pin";
import Time from "./Time";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useProfileImages } from "../context/ProfileImagesContext";

interface ProfileProps {
  showProfile: boolean;
  thisUser: string | null;
  eventsUser: string | null;
  pins: Pin[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  setCurrentPlaceId: (id: string | null) => void;
  onFriendshipChange: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  onFriendshipChange,
  showProfile,
  thisUser,
  eventsUser,
  pins,
  setPins,
  setCurrentPlaceId,
}) => {
  const { uploadProfileImage, isUploading } = useProfileImage();
  const { imageUrls } = useProfileImages();
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<"connect" | "connected" | "pending">("connect");
  const userEvents = pins.filter((pin) => pin.username === eventsUser);
  const eventUserImageUrl = eventsUser ? imageUrls[eventsUser] : null;

  // Fetch friend status
  useEffect(() => {
    const fetchFriendStatus = async () => {
      if (!thisUser || !eventsUser) return;
      
      try {
        const response = await axios.get(`/api/users/${thisUser}`);
        const user = response.data.data;
        if (user.friends.includes(eventsUser)) {
          setFriendStatus("connected");
        } else if (user.sentFriendRequests.includes(eventsUser)) {
          setFriendStatus("pending");
        } else {
          setFriendStatus("connect");
        }
      } catch (err) {
        console.error("Error fetching friend status:", err);
      }
    };
    fetchFriendStatus();
  }, [thisUser, eventsUser]);

  // Reset temp image when eventUserImageUrl changes (new image uploaded)
  useEffect(() => {
    if (eventUserImageUrl) {
      setTempImageUrl(null);
    }
  }, [eventUserImageUrl]);

  const handleDelete = async (pinId: string) => {
    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter((pin) => pin._id !== pinId));
      setCurrentPlaceId(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleImageClick = () => {
    if (thisUser !== eventsUser) return;
  
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
  
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !thisUser) return;
  
      try {
        const tempUrl = URL.createObjectURL(file);
        setTempImageUrl(tempUrl);
        await uploadProfileImage(file, thisUser);
        
        URL.revokeObjectURL(tempUrl);
      } catch (err) {
        console.error("Upload failed:", err);
        setTempImageUrl(null);
      }
    };
  
    input.click();
  };

  const renderUserInfo = (isMobile = false) => {
    const imageUrl = tempImageUrl || eventUserImageUrl || noImage;
    
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            className={`${
              isMobile ? 'size-12 min-w-12' : 'size-40 -mt-1 lg:size-42'
            } object-cover rounded-full transition-opacity duration-300 ${
              isUploading ? 'opacity-50' : 'opacity-100'
            }`}
            src={imageUrl}
            alt="user-image"
            onClick={handleImageClick}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
        {isMobile && <span className="font-semibold text-lg">{eventsUser || thisUser}</span>}
        {isMobile && thisUser && eventsUser && thisUser !== eventsUser && (
          <Connect 
            onFriendshipChange={onFriendshipChange} 
            thisUser={thisUser} 
            eventsUser={eventsUser} 
            friendStatus={friendStatus}
            setFriendStatus={setFriendStatus}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`z-10 fixed mx-2 bottom-2 w-[calc(100%-1rem)] h-2/5 bg-white transition-all duration-700 ease-in-out transform ${
        showProfile ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      } overflow-hidden rounded-t-lg`}
    >
      <div className="h-full p-4 flex flex-col md:flex-row gap-4">
        {/* Mobile header */}
        <div className="flex justify-between items-center md:hidden">
          <h1>{thisUser === eventsUser ? "My Events" : `${eventsUser}'s Events`}</h1>
          {renderUserInfo(true)}
        </div>
 
        {/* Desktop profile */}
        <div className="hidden md:flex md:flex-col items-center gap-2">
          {renderUserInfo()}
          <span className="font-semibold text-center text-3xl">{eventsUser || thisUser}</span>
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
                  {/* Desktop layout */}
                  <div className="hidden md:grid md:grid-cols-[1.5fr,2fr,160px] lg:grid-cols-[1.5fr,2fr,1fr] items-center">
                    <div>
                      <h4
                        className={`text-lg font-semibold ${
                          thisUser !== event.username ? "cursor-pointer hover:text-blue-600" : ""
                        }`}
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