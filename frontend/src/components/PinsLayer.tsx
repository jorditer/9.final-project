import { Marker, Popup } from "react-map-gl";
import MapMarker from "./MapMarker";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";
import Time from "./Time";
import { Trash2, MapPin, UsersRound } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import AssistantsDisplay from "./AssistantsDisplay";

interface PinsLayerProps {
  pins: Pin[];
  currentPlaceId: string | null;
  thisUser: string | null;
  viewport: {
    zoom: number;
  };
  friendshipRefresh: number;
  onMarkerClick: (id: string, lat: number, long: number) => void;
  onPopupClose: () => void;
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  setEventsUser: (username: string) => void;
  setShowProfile: (show: boolean) => void;
}

const PinsLayer = ({
  pins,
  currentPlaceId,
  thisUser,
  viewport,
  onMarkerClick,
  onPopupClose,
  setPins,
  friendshipRefresh,
  setEventsUser,
  setShowProfile,
}: PinsLayerProps) => {
  const [friendsList, setFriendsList] = useState<string[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (thisUser) {
        try {
          const response = await axios.get(`/api/users/${thisUser}`);
          setFriendsList(response.data.data.friends);
        } catch (err) {
          console.error("Error fetching friends list:", err);
        }
      }
    };

    fetchFriends();
  }, [thisUser, friendshipRefresh]);

  const filteredPins = pins.filter(
    (pin) => pin.username === thisUser || friendsList.includes(pin.username)
  );

  const handleDelete = async (pinId: string) => {
    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter((pin) => pin._id !== pinId));
      onPopupClose();
    } catch (err) {
      console.error("Error deleting pin:", err);
    }
  };

  const openInGoogleMaps = (lat: number, long: number) => {
    const url = `https://www.google.com/maps?q=${lat},${long}`;
    window.open(url, "_blank");
  };

return (
  <div className="pins-layer">
    {filteredPins.map((pin: Pin) => (
      <div key={pin._id} className="pin-container">
        {/* Pin Marker */}
        <Marker 
          longitude={pin.long} 
          latitude={pin.lat} 
          anchor="bottom"
        >
          <MapMarker
            color={pin.username === thisUser ? "tomato" : "blue"}
            zoom={viewport.zoom}
            onClick={() => onMarkerClick(pin._id, pin.lat, pin.long)}
          />
        </Marker>

        {/* Pin Popup */}
        {currentPlaceId === pin._id && (
          <Popup
            latitude={pin.lat}
            longitude={pin.long}
            closeButton={true}
            closeOnClick={false}
            onClose={onPopupClose}
            anchor="left"
          >
            <div className="flex flex-col space-y-4 max-w-[300px]">
              {/* Delete Button */}
              {pin.username === thisUser && (
                <button
                  onClick={() => handleDelete(pin._id)}
                  className="absolute right-1 top-1 p-1.5 rounded-full hover:bg-red-50 transition-colors z-10"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}

              {/* Title Section */}
              <div className="bg-gray-100 p-3 -mx-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                  {pin.title}
                </h2>
              </div>

              {/* Content Section */}
              <div className="px-3 space-y-3">
                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="mt-1 text-gray-500" />
                  <h3
                    className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer mt-1"
                    onClick={() => openInGoogleMaps(pin.lat, pin.long)}
                  >
                    {pin.location}
                  </h3>
                </div>

                {/* Description */}
                {pin.description && (
                  <div className="text-sm text-gray-600 leading-relaxed break-words">
                    {pin.description}
                  </div>
                )}

                {/* Date */}
                <div className="text-sm font-medium text-gray-700">
                  <Time date={pin.date} />
                </div>

                {/* Assistants */}
                <div className="flex items-center">
                  <UsersRound className="text-gray-500"/>
                  <AssistantsDisplay
                    p={pin}
                    thisUser={thisUser}
                    setPins={setPins}
                    assistants={pin.assistants}
                  />
                </div>

                {/* Footer Info */}
                <div className="text-xs text-nowrap text-gray-500 border-t pt-2 mt-2">
                  Created by{" "}
                  <a
                    className="font-medium cursor-pointer text-gray-700 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventsUser(pin.username);
                      setShowProfile(true);
                    }}
                  >
                    {pin.username}
                  </a>
                  <span className="mx-1">·</span>
                  <span className="italic">
                    {formatDistanceToNow(new Date(pin.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </div>
    ))}
  </div>
);
};

export default PinsLayer;