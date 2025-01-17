import Register from "./Register";
import Form from "./Form";
import Login from "./Login";
import Pop_up from "../interfaces/Popup";
import Map, { Popup } from "react-map-gl";
// import useDoubleTap from "../hooks/useDoubleTap";
import { useState, useEffect } from "react";
import axios from "axios";
import Pin from "../interfaces/Pin";
import PinsLayer from "./PinsLayer";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [thisUser, setThisUser] = useState<string | null>("Jordi");
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Pop_up | null>(null);
  const [noUser, setNoUser] = useState(true);
  const [viewport, setViewport] = useState({
    latitude: 41.38879,
    longitude: 2.15899,
    zoom: 12,
  });

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
        <PinsLayer
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
        {noUser && <Register setNoUser={setNoUser} />}
        {/* <Login /> */}
        {thisUser && <button className="bg-red-500 absolute top-2 right-2 p-2 text-nowrap login">Log out</button>}
      </Map>
    </div>
  );
}

export default App;
