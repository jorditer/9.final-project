import { useEffect, useMemo } from "react";
import noImage from "../assets/imgs/no-image.jpg"
import { useEventAssistant } from "../hooks/useEventAssistant";
import { useProfileImages } from "../context/ProfileImagesContext";
import Pin from "../interfaces/Pin";

interface AssistantsDisplayProps {
  assistants: string[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  thisUser: string | null;
  p: Pin;
}

const AssistantsDisplay = ({assistants, setPins, thisUser, p}: AssistantsDisplayProps) => {
  const { toggleAssistant } = useEventAssistant(setPins);
  const { imageUrls, prefetchImages } = useProfileImages();
  const maxDisplay = 3;
  const displayCount = assistants.length;

    const displayedAssistants = useMemo(() => 
      assistants.slice(0, maxDisplay).map(username => ({
        username,
        imageUrl: imageUrls[username] || null
      }))
    , [assistants, imageUrls]);

  // Fetch ONLY images that aren't cached
  useEffect(() => {
    const uncachedAssistants = displayedAssistants
      .filter(({ imageUrl }) => !imageUrl)
      .map(({ username }) => username);
  
    if (uncachedAssistants.length > 0) {
      prefetchImages(uncachedAssistants);
    }
  }, [displayedAssistants]);

  return (
    <div onClick={() => thisUser && toggleAssistant(p, thisUser)} 
        className="flex -space-x-4 rtl:space-x-reverse my-1 ms-3 justify-start"
    > 
      {displayedAssistants.map(({username, imageUrl}) => (
        <img 
          key={username} 
          className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800 object-cover" 
          src={imageUrl || noImage}
          alt={username} 
        />
      ))}
      <a className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">
        {displayCount}
      </a>
    </div>
  );
};

export default AssistantsDisplay;