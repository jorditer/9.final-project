import SearchBar from "./SearchBar";
import Form from "./Form";
import Request from "./Request"
import Pop_up from "../interfaces/Popup";
import Map, { Popup } from "react-map-gl";
import Profile from "./Profile";
// import useDoubleTap from "../hooks/useDoubleTap";
import { useState, useEffect } from "react";
import axios from "axios";
import Pin from "../interfaces/Pin";
import PinsLayer from "./PinsLayer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router";
import { ReactComponent as ArrowIcon } from "../assets/imgs/arrow.svg?react";


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

  const [viewport, setViewport] = useState({
    latitude: 41.38879,
    longitude: 2.15899,
    zoom: 12,
  });

  // console.log(thisUser);

  const navigate = useNavigate();

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/api/pins"); // Used proxy in package.json so no need for full url
        setPins(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleNewPin = (newPin: Pin) => {
    setPins((prev) => [...prev, newPin]);
    setNewEvent(null); // Close popup after creation
  };

  const handleMarkerClick = (id: string, lat: number, long: number): void => {
    setCurrentPlaceId(id);
    // setViewport((prev) => ({
    //   ...prev,
    //   latitude: lat,
    //   longitude: long,
    // }));
  };
  const handleAddEvent = (e: mapboxgl.MapMouseEvent) => {
    setCurrentPlaceId(null); // Close opened popup when creating a new Event
    const lat = e.lngLat.lat;
    const long = e.lngLat.lng;
    setNewEvent({
      lat,
      long,
    });
    // setViewport((prev) => ({  // For creating newEvents in mobile
    //   ...prev,
    //   latitude: lat,
    //   longitude: long,
    // }));
    // const onTap = useDoubleTap(handleAddEvent)
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
        // onTouchStart={onTap}
      >
        <Request thisUser={thisUser} />
      <Profile setPins={setPins} setCurrentPlaceId={setCurrentPlaceId} eventsUser={eventsUser} thisUser={thisUser} pins={pins} showProfile={showProfile}/>
        <PinsLayer
          setPins={setPins}
          pins={pins}
          currentPlaceId={currentPlaceId}
          thisUser={thisUser}
          viewport={viewport}
          onMarkerClick={handleMarkerClick}
          onPopupClose={() => setCurrentPlaceId(null)}
        />

        {newEvent && (
          <Popup latitude={newEvent.lat} closeButton={true} onClose={() => setNewEvent(null)} longitude={newEvent.long}>
            <Form coordinates={{ lat: newEvent.lat, long: newEvent.long }} onSuccess={handleNewPin} />
          </Popup>
        )}
        {/* {noUser && <Register setNoUser={setNoUser} />} */}
        {/* <Login /> */}
        {thisUser && <button onClick={handleLogout} className="p-2 text-base opacity-90 flex items-center justify-center text-white font-semibold text-center bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 absolute top-1 sm:top-2 right-2 sm:right-4 text-nowrap login">
          Log out
        </button>}
        <button
          onClick={() => setShowProfile(!showProfile)}
          className={`z-10 transition-all duration-700 absolute left-1/2 cursor-pointer -translate-x-1/2 ${
            showProfile ? "bottom-[calc(40%_+1rem)]" : "bottom-2"
          }`}
        >
          <ArrowIcon className={` [&_.circle-bg]:active:fill-black [&_.circle-bg]:hover:fill-gray-400 w-8 h-8 transition-transform duration-700 hover:fill-black fill-gray-800 ${!showProfile && 'rotate-180'}` }/>
        </button>
        <SearchBar setEventsUser={setEventsUser} />
      </Map>
    </div>
  );
}

export default MapView;
