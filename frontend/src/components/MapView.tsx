import SearchBar from "./SearchBar";
import User from "./User";
import Form from "./Form";
import Request from "./Request"
import Pop_up from "../interfaces/Popup";
import Map, { Popup } from "react-map-gl";
import Profile from "./Profile";
import { useState, useEffect } from "react";
import axios from "axios";
import Pin from "../interfaces/Pin";
import PinsLayer from "./PinsLayer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router";
import { ReactComponent as ArrowIcon } from "../assets/imgs/arrow.svg?react";
import { useProfileImageUrl } from "../hooks/useProfileImageUrl";

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

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get(`/api/pins?username=${thisUser}`);
        setPins(res.data.data);
      } catch (err) {
        console.log(err);
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

  return (
    <div className="h-lvh w-lvw">
      <Map
        style={{ width: "100%", height: "100%" }}
        {...viewport}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onMove={(evt) => setViewport(evt.viewState)}
        doubleClickZoom={false}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onDblClick={handleAddEvent}
      >
        <Request onFriendshipChange={() => setFriendshipRefresh(prev => prev + 1)} thisUser={thisUser} />
        <Profile 
          onFriendshipChange={() => setFriendshipRefresh(prev => prev + 1)} 
          setPins={setPins} 
          setCurrentPlaceId={setCurrentPlaceId} 
          eventsUser={eventsUser} 
          thisUser={thisUser} 
          pins={pins} 
          showProfile={showProfile}
        />
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
        />

        {newEvent && (
          <Popup className="[&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:overflow-hidden [&_.mapboxgl-popup-content]:rounded-lg" latitude={newEvent.lat} closeButton={true} onClose={() => setNewEvent(null)} longitude={newEvent.long}>
            <Form thisUser={thisUser} coordinates={{ lat: newEvent.lat, long: newEvent.long }} onSuccess={handleNewPin} />
          </Popup>
        )}
        <User thisUser={thisUser} setEventsUser={setEventsUser} setShowProfile={setShowProfile} handleLogout={handleLogout} />
        <button
          onClick={() => setShowProfile(!showProfile)}
          className={`z-10 transition-all duration-700 absolute left-1/2 cursor-pointer -translate-x-1/2 ${
            showProfile ? "bottom-[calc(40%_+1rem)]" : "bottom-2"
          }`}
        >
          <ArrowIcon className={`[&_.circle-bg]:active:fill-black [&_.circle-bg]:hover:fill-gray-400 w-8 h-8 transition-transform duration-700 hover:fill-black fill-gray-800 ${!showProfile && 'rotate-180'}`}/>
        </button>
        <SearchBar setShowProfile={setShowProfile} setEventsUser={setEventsUser} />
      </Map>
    </div>
  );
}

export default MapView;