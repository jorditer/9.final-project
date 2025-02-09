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
  const [newLocation, setNewLocation] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDescriptionConfirm = async (pinId: string) => {
    if (newDescription) {
      try {
        await api.patch(`/pins/${pinId}/description`, { description: newDescription });
        setPins(pins.map((p) => (p._id === pinId ? { ...p, description: newDescription } : p)));
        setEditingDescription(null);
      } catch (err) {
        console.error("Error updating description:", err);
      }
    }
  };

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

  const handleTitleConfirm = async (pinId: string) => {
    if (newTitle) {
      try {
        await api.patch(`/pins/${pinId}/title`, { title: newTitle });
        setPins(pins.map((p) => (p._id === pinId ? { ...p, title: newTitle } : p)));
        setEditingTitle(null);
      } catch (err) {
        console.error("Error updating title:", err);
      }
    }
  };

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
                <div className="absolute -right-[4.5px] top-5">
                  <button
                    onClick={() => setShowDeleteConfirm(pin._id)}
                    className="rounded-full hover:bg-hoverDelete transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm === pin._id && (
                    <div className="absolute right-6 top-0 border bg-secondary shadow-lg rounded-md py-2 px-3 z-10 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Delete?</span>
                        <div className="flex">
                          <button
                            onClick={() => {
                              eventHandlers.handleDelete(pin._id);
                              setShowDeleteConfirm(null);
                            }}
                            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
                            title="Confirm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
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
              )}

              <div className="flex flex-col space-y-4 max-w-[300px]">
                {/* Title Section */}
                <div className="bg-secondary border-b">
                  <div className="flex items-center p-3">
                    <div className="relative flex items-center group">
                      <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words text-nowrap">
                        {pin.title}
                      </h2>
                      {pin.username === thisUser && (
                        <div
                          className={`ml-1.5 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-dark transition-opacity me-4 ${
                            editingTitle === pin._id ? "opacity-100" : ""
                          }`}
                          onClick={() => setEditingTitle(pin._id)}
                        >
                          <Pencil size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Title Edit Interface */}
                {editingTitle === pin._id && (
                  <div className="absolute left-0 top-0 border bg-secondary shadow-lg rounded-md py-2 px-2 z-10 w-full">
                    <div className="flex">
                      <input
                        type="text"
                        className="bg-primary/90 min-w-20 w-full py-0 text-sm border rounded px-1 min-h-0 text-ellipsis noclass leading-none"
                        defaultValue={pin.title}
                        maxLength={22}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter" && newTitle) {
                            handleTitleConfirm(pin._id);
                          } else if (e.key === "Escape") {
                            setEditingTitle(null);
                          }
                        }}
                      />
                      <div className="flex">
                        <button
                          onClick={() => handleTitleConfirm(pin._id)}
                          className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
                          title="Confirm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingTitle(null)}
                          className="px-1.5 rounded-xl text-cancel hover:bg-hoverDelete text-lg"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="px-3 space-y-3">
                  <div className="relative flex items-center gap-2">
                    <div className="relative group/location">
                      <div
                        className={`w-5 h-5 text-gray-600 flex-shrink-0 ${
                          pin.username === thisUser && "cursor-pointer hover:text-dark"
                        }`}
                        onClick={pin.username === thisUser ? () => setEditingLocation(pin._id) : undefined}
                      >
                        <MapPin
                          className={`absolute ${pin.username === thisUser ? "group-hover/location:opacity-0" : ""} ${
                            editingLocation === pin._id ? "opacity-0" : ""
                          }`}
                          size={20}
                        />
                        {pin.username === thisUser && (
                          <Pencil
                            className={`absolute opacity-0 ${
                              editingLocation === pin._id ? "opacity-100" : "group-hover/location:opacity-100"
                            }`}
                            size={20}
                          />
                        )}
                      </div>
                    </div>
                    <h3
                      className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                      title="Click to open location in Google Maps"
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
                            maxLength={20}
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

                  {/*  Description */}
                  {/* Description */}
                  {pin.description && (
                    <div className="relative flex items-center group">
                      <div className="text-sm text-gray-600 leading-relaxed break-words">{pin.description}</div>
                      {pin.username === thisUser && (
                        <div
                          className={`ml-1.5 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-dark transition-opacity me-2 ${
                            editingDescription === pin._id ? "opacity-100" : ""
                          }`}
                          onClick={() => setEditingDescription(pin._id)}
                        >
                          <Pencil size={16} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description Edit Interface */}
                  {editingDescription === pin._id && (
                    <div className="absolute left-0 border bg-secondary shadow-lg rounded-md py-2 px-2 z-10 w-full">
                      <div className="flex">
                        <textarea
                          className="bg-primary/90 min-w-20 w-full py-1 text-sm border rounded px-1 min-h-[60px] text-ellipsis noclass"
                          defaultValue={pin.description}
                          maxLength={60}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                          autoFocus
                          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === "Enter" && e.ctrlKey && newDescription) {
                              handleDescriptionConfirm(pin._id);
                            } else if (e.key === "Escape") {
                              setEditingDescription(null);
                            }
                          }}
                          placeholder="What is the plan?"
                        />
                        <div className="flex">
                          <button
                            onClick={() => handleDescriptionConfirm(pin._id)}
                            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
                            title="Confirm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingDescription(null)}
                            className="px-1.5 rounded-xl text-cancel hover:bg-hoverDelete text-lg"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-sm font-medium text-gray-700">
                    <Time pin={pin} isOwner={pin.username === thisUser} updatePinDate={eventHandlers.updatePinDate} />
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
                    <span className="italic">
                      {formatDistanceToNow(new Date(pin.createdAt), {
                        addSuffix: true,
                        includeSeconds: true,
                      })
                        .replace("about ", "")
                        .replace("less than ", "")}
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
