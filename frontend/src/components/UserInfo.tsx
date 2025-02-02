import { useState, useEffect } from "react";
import { useProfileImage } from "../hooks/useProfileImage";
import { useProfileImages } from "../context/ProfileImagesContext";
import { Pencil } from "lucide-react"; // Import Pencil icon
import noImage from "../assets/imgs/no-image.jpg";
import Connect from "./Connect";
import { FriendStatus } from "../hooks/useFriendStatus";

interface UserInfoProps {
  isMobile?: boolean;
  thisUser: string | null;
  eventsUser: string | null;
  onFriendshipChange: () => void;
  friendStatus: FriendStatus;
  setFriendStatus: (status: FriendStatus) => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  isMobile = false,
  thisUser,
  eventsUser,
  onFriendshipChange,
  friendStatus,
  setFriendStatus
}) => {
  const { uploadProfileImage, isUploading } = useProfileImage();
  const { imageUrls } = useProfileImages();
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const eventUserImageUrl = eventsUser ? imageUrls[eventsUser] : null;

  useEffect(() => {
    if (eventUserImageUrl) {
      setTempImageUrl(null);
    }
  }, [eventUserImageUrl]);

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

  const finalImageUrl = tempImageUrl || eventUserImageUrl || noImage;
  const isOwnProfile = thisUser === eventsUser;

  return (
    <div className="flex items-center gap-3">
      <div 
        className="relative"
        onMouseEnter={() => isOwnProfile && setShowEditOverlay(true)}
        onMouseLeave={() => isOwnProfile && setShowEditOverlay(false)}
      >
        <img
          className={`transition duration-300 ease-in-out ${
            isMobile ? 'size-12 min-w-12' : 'size-40 -mt-1 lg:size-42'
          } object-cover rounded-full ${
            isUploading ? 'opacity-50' : 'opacity-100'
          }`}
          src={finalImageUrl}
          alt="user-image"
          onClick={handleImageClick}
        />
        {/* Edit Overlay */}
        {showEditOverlay && isOwnProfile && !isUploading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer"
            onClick={handleImageClick}
          >
            <Pencil className="w-6 h-6 text-white" />
          </div>
        )}
        {/* Loading Spinner */}
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

export default UserInfo;