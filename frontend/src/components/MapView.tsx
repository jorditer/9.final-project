import api from "../services/api";
import SearchBar from "./SearchBar";
import Form from "./Form";
import Request from "./Request";
import Pop_up from "../interfaces/Popup";
import Map, { Popup } from "react-map-gl";
import Profile from "./Profile";
import Header from "./Header";
import { useState, useEffect } from "react";
import Pin from "../interfaces/Pin";
import PinsLayer from "./PinsLayer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router";
import { ReactComponent as ArrowIcon } from "../assets/imgs/arrow.svg?react";
import { useEvents } from "../hooks/useEvents";

interface MapViewProps {
  thisUser: string | null;
  onLogout: () => void;
}

function MapView({ thisUser, onLogout }: MapViewProps) {
  const [timeFilter, setTimeFilter] = useState<"all" | "day" | "week" | "month">("all");
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
  const [allPins, setAllPins] = useState<Pin[]>([]);
  
  const eventHandlers = useEvents(pins, setPins, thisUser);

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await api.get(`/pins`, {
          params: { username: thisUser },
        });
        setAllPins(res.data.data);
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
    setAllPins(prev => [...prev, newPin]);
    setPins(prev => [...prev, newPin]);
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
  const handleFilterChange = (filter: "all" | "day" | "week" | "month") => {
    setTimeFilter(filter);
  };

  useEffect(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfDayTime = startOfDay.getTime();
    const endOfDayTime = startOfDayTime + 24 * 60 * 60 * 1000;
    const startOfWeekTime = startOfWeek.getTime();
    const endOfWeekTime = startOfWeekTime + 7 * 24 * 60 * 60 * 1000;
    const startOfMonthTime = startOfMonth.getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfMonthTime = endOfMonth.getTime();

    setPins(allPins.filter(pin => {
      const eventTime = new Date(pin.date).getTime();
      
      switch (timeFilter) {
        case "day":
          return eventTime >= startOfDayTime && eventTime < endOfDayTime;
        case "week":
          return eventTime >= startOfWeekTime && eventTime < endOfWeekTime;
        case "month":
          return eventTime >= startOfMonthTime && eventTime <= endOfMonthTime;
        default:
          return true;
      }
    }));
  }, [timeFilter, allPins]);

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
    <div className="fixed top-16 left-0 right-0 px-4 z-10">
      <SearchBar
        setShowProfile={setShowProfile}
        setEventsUser={setEventsUser}
        onLocationSelect={handleLocationSelect}
      />
    </div>
      <Header
        thisUser={thisUser}
        handleLogout={handleLogout}
        setEventsUser={setEventsUser}
        setShowProfile={setShowProfile}
        onFilterChange={handleFilterChange}
      />
      <Map
        style={{ width: "100%", height: "100%" }}
        {...viewport}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onMove={(evt) => setViewport(evt.viewState)}
        doubleClickZoom={false}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onDblClick={handleAddEvent}
      >
        <Request onFriendshipChange={() => setFriendshipRefresh((prev) => prev + 1)} thisUser={thisUser} />
        {/* Profile Container with Arrow */}
        <div className={`z-20 mb-[60px] sm:mb-0 fixed mx-2 bottom-1 w-[calc(100%-1rem)] ${showProfile ? "" : "pointer-events-none"}`}>
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
              className={`mb-1 bg-primary h-[33vh] min-h-[300px] rounded-t-lg rounded-b-md overflow-hidden transition-opacity duration-700 ${
                showProfile ? "opacity-100" : "opacity-0"
              }`}
            >
              <Profile
                eventsUser={eventsUser}
                thisUser={thisUser}
                pins={pins}
                setPins={setPins}
                updatePinDate={eventHandlers.updatePinDate}
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
          viewport={{ zoom: viewport.zoom }}
          onMarkerClick={handleMarkerClick}
          onPopupClose={() => setCurrentPlaceId(null)}
          setEventsUser={setEventsUser}
          setShowProfile={setShowProfile}
          eventHandlers={eventHandlers}
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
      </Map>
    </div>
  );
}

export default MapView;
