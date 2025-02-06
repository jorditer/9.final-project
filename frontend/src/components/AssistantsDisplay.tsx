import { useEffect, useMemo, useCallback } from "react";
import noImage from "../assets/imgs/no-image.jpg"
import { useEventAssistant } from "../hooks/useEventAssistant";
import { useProfileImages } from "../context/ProfileImagesContext";
import Pin from "../interfaces/Pin";

interface AssistantsDisplayProps {
  
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  thisUser: string | null;
  p: Pin;
}

const AssistantsDisplay = ({setPins, thisUser, p}: AssistantsDisplayProps) => {
  const { toggleAssistant } = useEventAssistant(setPins);
  const { imageUrls, prefetchImages } = useProfileImages();
  const assistants = p.assistants;
  const maxDisplay = 3;
  const displayCount = assistants.length;
  const isUserAssistant = thisUser && assistants.includes(thisUser);
  const isEventOwner = thisUser === p.username;


  const assistantsToDisplay = useMemo(() => 
    assistants.slice(0, maxDisplay)
  , [assistants]);

  const fetchUncachedImages = useCallback(() => {
    const uncachedAssistants = assistantsToDisplay.filter(
      username => !imageUrls[username]
    );
    if (uncachedAssistants.length > 0) {
      prefetchImages(uncachedAssistants);
    }
  }, [assistantsToDisplay, imageUrls, prefetchImages]);

  useEffect(() => {
    fetchUncachedImages();
  }, [assistantsToDisplay]);

  const displayedAssistants = useMemo(() => 
    assistantsToDisplay.map(username => ({
      username,
      imageUrl: imageUrls[username] || null
    }))
  , [assistantsToDisplay, imageUrls]);

  const getActionText = () => {
    if (!thisUser) return "";
    return isUserAssistant ? "Click to leave event" : "Click to join event";
  };

  const getBadgeClasses = () => {
    if (!thisUser) return 'bg-gray-700';
    if (isEventOwner) return 'bg-gray-500'; // Static gray for owner
    return isUserAssistant 
      ? 'bg-accept group-hover:bg-deny hover:bg-deny' 
      : 'bg-gray-400 group-hover:bg-accept hover:bg-accept';
  };

  return (
    <div 
      role="button"
      aria-label={getActionText()}
      // Disable click handler if user is owner
      onClick={() => thisUser && !isEventOwner && toggleAssistant(p, thisUser)} 
      className={`
        flex items-center my-1
        ${thisUser && !isEventOwner ? 'cursor-pointer group' : 'cursor-default'}
        rounded-lg p-1 
        ${!isEventOwner && 'hover:bg-gray-50 dark:hover:bg-gray-800'}
        transition-colors duration-200
      `}
      title={getActionText()}
    > 
      <div className="flex items-center">
        <div className="flex -space-x-4 rtl:space-x-reverse">
          {displayedAssistants.map(({username, imageUrl}) => (
            <img 
              key={username} 
              className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800 object-cover" 
              src={imageUrl || noImage}
              alt={username} 
            />
          ))}
          
          <div className={`
            flex items-center justify-center w-8 h-8 
            text-xs font-medium text-white
            border-2 border-white rounded-full 
            dark:border-gray-800
            transition-all duration-300 ease-in-out
            ${getBadgeClasses()}
          `}>
            <span className="transition-all duration-200 ease-in-out transform">
              {displayCount}
            </span>
          </div>
        </div>
      </div>

      {/* Only show Going/Join text if user is not the owner */}
      {thisUser && !isEventOwner && (
        <span className={`
          text-sm ml-2 transition-colors duration-200
          ${isUserAssistant 
            ? 'text-accept group-hover:text-deny hover:text-red-600' 
            : 'text-gray-600 group-hover:text-accept hover:text-acccept'
          }
        `}>
          {isUserAssistant ? 'Going' : 'Join'}
        </span>
      )}
      
      {/* Show static "Owner" text if user is the owner */}
      {isEventOwner && (
        <span className="text-sm ml-2 text-gray-500">
          Owner
        </span>
      )}
    </div>
  );
};

export default AssistantsDisplay;