import { Marker, Popup } from "react-map-gl";
import MapMarker from "./MapMarker";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";
import Time from "./Time";
import { Trash2, MapPin, UsersRound, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import AssistantsDisplay from "./AssistantsDisplay";
import api from "../services/api";

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
  setCurrentPlaceId: (id: string | null) => void;
  eventHandlers: {
    handleDelete: (pinId: string) => Promise<void>;
    updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
  };
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
  eventHandlers,
}: PinsLayerProps) => {
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [hoveringLocation, setHoveringLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<string>("");

  useEffect(() => {
    const fetchFriends = async () => {
      if (thisUser) {
        try {
          const response = await api.get(`/users/${thisUser}`);
          setFriendsList(response.data.data.friends);
        } catch (err) {
          console.error("Error fetching friends list:", err);
        }
      }
    };

    fetchFriends();
  }, [thisUser, friendshipRefresh]);

  const handleLocationConfirm = async (pinId: string) => {
    if (newLocation) {
      try {
        await api.patch(`/pins/${pinId}/location`, { location: newLocation });
        setPins(pins.map((p) => (p._id === pinId ? { ...p, location: newLocation } : p)));
        setEditingLocation(null);
      } catch (err) {
        console.error("Error updating location:", err);
      }
    }
  };

  const openInGoogleMaps = (lat: number, long: number) => {
    const url = `https://www.google.com/maps?q=${lat},${long}`;
    window.open(url, "_blank");
  };

  const filteredPins = pins.filter((pin) => pin.username === thisUser || friendsList.includes(pin.username));

  return (
    <div className="pins-layer">
      {filteredPins.map((pin: Pin) => (
        <div key={pin._id} className="pin-container">
          {/* Pin Marker */}
          <Marker longitude={pin.long} latitude={pin.lat} anchor="bottom">
            <MapMarker
              color={pin.username === thisUser ? "tomato" : "blue"}
              zoom={viewport.zoom}
              onClick={() => onMarkerClick(pin._id, pin.lat, pin.long)}
            />
          </Marker>

          {/* Popup */}
          {currentPlaceId === pin._id && (
            <Popup
              latitude={pin.lat}
              longitude={pin.long}
              closeButton={true}
              closeOnClick={false}
              onClose={onPopupClose}
              anchor="left"
              className="custom-popup"
            >
              {/* Delete Button */}
              {pin.username === thisUser && (
                <button
                  onClick={() => eventHandlers.handleDelete(pin._id)}
                  className="absolute -right-[4.5px] top-5 rounded-full hover:bg-hoverDelete transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}

              <div className="flex flex-col space-y-4 max-w-[300px]">
                {/* Title Section */}
                <div className="bg-secondary border-b">
                  <div className="flex items-center p-3">
                    <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">{pin.title}</h2>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-3 space-y-3">
                  {/* Location */}
                  <div className="relative flex items-center gap-2">
                    <div
                      className={`text-gray-600 flex-shrink-0 ${
                        pin.username === thisUser && "cursor-pointer hover:text-dark"
                      }`}
                      onClick={pin.username === thisUser ? () => setEditingLocation(pin._id) : undefined}
                      onMouseEnter={pin.username === thisUser ? () => setHoveringLocation(pin._id) : undefined}
                      onMouseLeave={() => setHoveringLocation(null)}
                    >
                      {pin.username === thisUser && (hoveringLocation === pin._id || editingLocation === pin._id) ? (
                        <Pencil size={20} />
                      ) : (
                        <MapPin size={20} />
                      )}
                    </div>
                    <h3
                      className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                      onClick={() => openInGoogleMaps(pin.lat, pin.long)}
                    >
                      {pin.location}
                    </h3>

                    {/* Location Edit Interface */}
                    {editingLocation === pin._id && (
                      <div className="absolute left-0 border -top-8 bg-secondary shadow-lg rounded-md py-2 px-2 z-10 w-full">
                        <div className="flex">
                          <input
                            type="text"
                          className="bg-primary/90 min-w-20 w-full py-0 text-sm border rounded px-1 min-h-0 text-ellipsis noclass leading-none"
                            defaultValue={pin.location}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === "Enter" && newLocation) {
                                handleLocationConfirm(pin._id);
                              } else if (e.key === "Escape") {
                                setEditingLocation(null);
                              }
                            }}
                          />
                          <div className="flex">
                            <button
                              onClick={() => handleLocationConfirm(pin._id)}
                              className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
                              title="Confirm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingLocation(null)}
                              className="px-1.5 rounded-xl text-cancel hover:bg-hoverDelete text-lg"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {pin.description && (
                    <div className="text-sm text-gray-600 leading-relaxed break-words">{pin.description}</div>
                  )}

                  {/* Date */}
                  <div className="text-sm font-medium text-gray-700">
                    <Time
                      pin={pin}
                      isOwner={pin.username === thisUser}
                      updatePinDate={eventHandlers.updatePinDate}
                    />
                  </div>

                  {/* Assistants */}
                  <div className="flex items-center">
                    <UsersRound className="text-gray-500" />
                    <AssistantsDisplay p={pin} thisUser={thisUser} setPins={setPins} />
                  </div>

                  {/* Footer with full-width background */}
                  <div className="text-nowrap bg-secondary -mx-3 px-3 text-gray-500 border-t py-1.5 mt-2 ">
                    <span>Created by </span>
                    <a
                      className="font-medium cursor-pointer text-gray-700 hover:text-dark"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEventsUser(pin.username);
                        setShowProfile(true);
                      }}
                    >
                      {pin.username}
                    </a>
                    <span className="mx-1">·</span>
                    <span className="italic">{formatDistanceToNow(new Date(pin.createdAt), { 
    addSuffix: true,
    includeSeconds: true,
  }).replace('about ', '').replace('less than ', '')}</span>
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
