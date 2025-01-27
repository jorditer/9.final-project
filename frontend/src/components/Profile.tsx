import { useState } from "react";
import { useProfileImage } from "../hooks/useProfileImage";
import noImage from "../assets/imgs/no-image.jpg";
import Connect from "./Connect";
import Pin from "../interfaces/Pin";
import Time from "./Time";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useProfileImageUrl } from "../hooks/useProfileImageUrl";
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
  const {imageUrls} = useProfileImages();
  const userEvents = pins.filter((pin) => pin.username === eventsUser);
  const eventUserImageUrl = eventsUser ? imageUrls[eventsUser] : null;

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
        await uploadProfileImage(file, thisUser);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    };
  
    input.click();
  };

  const renderUserInfo = (isMobile = false) => (
    <div className="flex items-center gap-3">
      <img
        className={`${isMobile ? 'size-12 min-h-10' : 'size-40 -mt-1 lg:size-42'} object-cover rounded-full`}
        src={eventUserImageUrl || noImage}
        alt="user-image"
        onClick={handleImageClick}
        style={{ opacity: isUploading ? 0.5 : 1 }}
      />
      {isMobile && <span className="font-semibold text-lg">{eventsUser || thisUser}</span>}
      {isMobile && thisUser && eventsUser && thisUser !== eventsUser && (
        <Connect onFriendshipChange={onFriendshipChange} thisUser={thisUser} eventsUser={eventsUser} />
      )}
    </div>
  );

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
    <Connect onFriendshipChange={onFriendshipChange} thisUser={thisUser} eventsUser={eventsUser} />
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
            {userEvents.length === 0 && <p className="text-gray-500 text-center">No events created yet :(</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
