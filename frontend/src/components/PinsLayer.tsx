import { Marker, Popup } from "react-map-gl";
import MapMarker from "./MapMarker";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";
import Time from "./Time";
import { Trash2, MapPin, UsersRound, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import AssistantsDisplay from "./AssistantsDisplay";
import EditModal from "./EditModal";
import api from "../services/api";
import DeleteConfirm from "./DeleteConfirm";

interface PinsLayerProps {
  pins: Pin[];
  currentPlaceId: string | null;
  thisUser: string | null;
  viewport: {
    zoom: number;
  };
  friendshipRefresh: number;
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  setEventsUser: (username: string) => void;
  setShowProfile: (show: boolean) => void;
  onMarkerClick: (id: string, lat: number, long: number) => void;
  onPopupClose: () => void;
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
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleTitleConfirm = async (pinId: string, newTitle: string) => {
    try {
      await api.patch(`/pins/${pinId}/title`, { title: newTitle });
      setPins(pins.map((p) => (p._id === pinId ? { ...p, title: newTitle } : p)));
      setEditingTitle(null);
    } catch (err) {
      console.error("Error updating title:", err);
    }
  };

  const handleLocationConfirm = async (pinId: string, newLocation: string) => {
    try {
      await api.patch(`/pins/${pinId}/location`, { location: newLocation });
      setPins(pins.map((p) => (p._id === pinId ? { ...p, location: newLocation } : p)));
      setEditingLocation(null);
    } catch (err) {
      console.error("Error updating location:", err);
    }
  };

  const handleDescriptionConfirm = async (pinId: string, newDescription: string) => {
    try {
      await api.patch(`/pins/${pinId}/description`, { description: newDescription });
      setPins(pins.map((p) => (p._id === pinId ? { ...p, description: newDescription } : p)));
      setEditingDescription(null);
    } catch (err) {
      console.error("Error updating description:", err);
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
          <Marker longitude={pin.long} latitude={pin.lat} anchor="bottom">
            <MapMarker
              color={pin.username === thisUser ? "tomato" : "blue"}
              zoom={viewport.zoom}
              onClick={() => onMarkerClick(pin._id, pin.lat, pin.long)}
            />
          </Marker>

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
             {pin.username === thisUser && (
  <div className="absolute -right-[1px] top-4 z-20">
    <button
      onClick={() => setShowDeleteConfirm(pin._id)}
      className="inline-flex items-center justify-center rounded-full p-1 hover:bg-hoverDelete transition-colors"
      title="Delete event"
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
    {showDeleteConfirm === pin._id && (
      <DeleteConfirm
        id={pin._id}
        showConfirm={showDeleteConfirm}
        setShowConfirm={setShowDeleteConfirm}
        onDelete={eventHandlers.handleDelete}
      />
    )}
  </div>
)}
              <div className="flex flex-col space-y-4 max-w-[300px]">
                <div className="bg-secondary border-b">
                  <div className="flex items-center p-3">
                    <div className="relative flex items-center group">
                      <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words text-nowrap">
                        {pin.title}
                      </h2>
                      {pin.username === thisUser && (
                        <div
                          className={`text-gray-600 ml-1.5 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-dark transition-opacity me-4 ${
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

                {editingTitle === pin._id && (
                  <EditModal
                    maxLength={22}
                    defaultValue={pin.title}
                    onConfirm={(value) => value && handleTitleConfirm(pin._id, value)}
                    onCancel={() => setEditingTitle(null)}
                  />
                )}

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

                    {editingLocation === pin._id && (
                      <EditModal
                        maxLength={20}
                        defaultValue={pin.location}
                        onConfirm={(value) => value && handleLocationConfirm(pin._id, value)}
                        onCancel={() => setEditingLocation(null)}
                      />
                    )}
                  </div>

                  {pin.description && (
                    <div className="relative flex items-center group">
                      <div className="text-sm text-gray-600 leading-relaxed break-words">
                        {pin.description}
                      </div>
                      {pin.username === thisUser && (
                        <div
                          className={`text-gray-600 ml-1.5 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-dark transition-opacity me-2 ${
                            editingDescription === pin._id ? "opacity-100" : ""
                          }`}
                          onClick={() => setEditingDescription(pin._id)}
                        >
                          <Pencil size={16} />
                        </div>
                      )}
                    </div>
                  )}

                  {editingDescription === pin._id && (
                    <EditModal
                      maxLength={60}
                      defaultValue={pin.description}
                      onConfirm={(value) => value && handleDescriptionConfirm(pin._id, value)}
                      onCancel={() => setEditingDescription(null)}
                    />
                  )}

                  <div className="text-sm font-medium text-gray-700">
                    <Time pin={pin} isOwner={pin.username === thisUser} updatePinDate={eventHandlers.updatePinDate} />
                  </div>

                  <div className="flex items-center">
                    <UsersRound className="text-gray-500" />
                    <AssistantsDisplay p={pin} thisUser={thisUser} setPins={setPins} />
                  </div>

                  <div className="text-nowrap bg-secondary -mx-3 px-3 text-gray-500 border-t py-1.5 mt-2">
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