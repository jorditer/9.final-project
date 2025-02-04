import api from '../services/api'; // Import our API service
import SearchBar from "./SearchBar";
import User from "./User";
import Form from "./Form";
import Request from "./Request";
import Pop_up from "../interfaces/Popup";
import Map, { Popup } from "react-map-gl";
import Profile from "./Profile";
import Header from './Header';
import { useState, useEffect } from "react";
import Pin from "../interfaces/Pin";
import PinsLayer from "./PinsLayer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router";
import { ReactComponent as ArrowIcon } from "../assets/imgs/arrow.svg?react";
import { useEvents } from "../hooks/useEvents"; // Add this import

interface MapViewProps {
  thisUser: string | null;
  onLogout: () => void;
}

function MapView({ thisUser, onLogout }: MapViewProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Pop_up | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [eventsUser, setEventsUser] = useState(thisUser);
  const [friendshipRefresh, setFriendshipRefresh] = useState(0);
  const [viewport, setViewport] = useState({
    latitude: 41.38879,
    longitude: 2.15899,
    zoom: 12,
  });
  const navigate = useNavigate();

  const eventHandlers = useEvents(pins, setPins, setCurrentPlaceId);

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await api.get(`/pins`, {
          params: { username: thisUser },
        });
        setPins(res.data.data);
      } catch (err) {
        console.error("Error fetching pins:", err);
      }
    };

    if (thisUser) {
      getPins();
    }
  }, [thisUser, friendshipRefresh]);

  const handleNewPin = (newPin: Pin) => {
    setPins((prev) => [...prev, newPin]);
    setNewEvent(null);
  };

  const handleMarkerClick = (id: string, lat: number, long: number): void => {
    setCurrentPlaceId(id);
  };

  const handleAddEvent = (e: mapboxgl.MapMouseEvent) => {
    setCurrentPlaceId(null);
    const lat = e.lngLat.lat;
    const long = e.lngLat.lng;
    setNewEvent({
      lat,
      long,
    });
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleLocationSelect = (lat: number, long: number) => {
    setViewport((prev) => ({
      ...prev,
      latitude: lat,
      longitude: long,
      zoom: 14,
    }));
  };

  return (
    <div className="h-lvh w-lvw">
      <Header></Header>
      <Map
        style={{ width: "100%", height: "calc(100vh - 56px)" }}
        {...viewport}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onMove={(evt) => setViewport(evt.viewState)}
        doubleClickZoom={false}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onDblClick={handleAddEvent}
      >
        <Request onFriendshipChange={() => setFriendshipRefresh((prev) => prev + 1)} thisUser={thisUser} />
        {/* Profile Container with Arrow */}
        <div className={`z-20 fixed mx-2 bottom-1 w-[calc(100%-1rem)] ${showProfile ? "" : "pointer-events-none"}`}>
          <div
            className={`relative transition-all duration-700 transform ${
              showProfile ? "translate-y-0" : "translate-y-[calc(100%_+_0.25rem)]"
            }`}
          >
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="absolute left-1/2 -top-12 -translate-x-1/2 z-20 cursor-pointer pointer-events-auto"
            >
              <ArrowIcon
                className={`[&_.circle-bg]:active:fill-black [&_.circle-bg]:hover:fill-gray-400 w-8 h-8 transition-transform duration-700 hover:fill-black fill-gray-800 ${
                  !showProfile && "rotate-180"
                }`}
              />
            </button>
            <div
              className={`mb-1 bg-primary h-2/5 min-h-72 max-h-[500px] rounded-t-lg rounded-b-md overflow-hidden transition-opacity duration-700 ${
                showProfile ? "opacity-100" : "opacity-0"
              }`}
            >
              <Profile
                onFriendshipChange={() => setFriendshipRefresh((prev) => prev + 1)}
                setPins={setPins}
                setCurrentPlaceId={setCurrentPlaceId}
                eventsUser={eventsUser}
                thisUser={thisUser}
                pins={pins}
                showProfile={showProfile}
                updatePinDate={eventHandlers.updatePinDate} // Pass the event handlers
              />
            </div>
          </div>
        </div>
        <PinsLayer
          friendshipRefresh={friendshipRefresh}
          setPins={setPins}
          pins={pins}
          currentPlaceId={currentPlaceId}
          thisUser={thisUser}
          viewport={viewport}
          onMarkerClick={handleMarkerClick}
          onPopupClose={() => setCurrentPlaceId(null)}
          setEventsUser={setEventsUser}
          setShowProfile={setShowProfile}
          setCurrentPlaceId={setCurrentPlaceId}
          eventHandlers={eventHandlers} // Pass the event handlers
        />

        {newEvent && (
          <Popup latitude={newEvent.lat} closeButton={true} onClose={() => setNewEvent(null)} longitude={newEvent.long}>
            <Form
              thisUser={thisUser}
              coordinates={{ lat: newEvent.lat, long: newEvent.long }}
              onSuccess={handleNewPin}
            />
          </Popup>
        )}
        <User
          thisUser={thisUser}
          setEventsUser={setEventsUser}
          setShowProfile={setShowProfile}
          handleLogout={handleLogout}
        />
        <SearchBar
          setShowProfile={setShowProfile}
          setEventsUser={setEventsUser}
          onLocationSelect={handleLocationSelect}
        />
      </Map>
    </div>
  );
}

export default MapView;
