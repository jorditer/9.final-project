// import { useState } from 'react'
// import pinIcon from "../assets/imgs/pin.svg";
import Form from './Form'
import Pop_up from '../interfaces/Popup'
import MapMarker from "./MapMarker";
import Map, { Marker, Popup } from "react-map-gl";
// import useDoubleTap from "../hooks/useDoubleTap";
import "../index.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const thisUser = "Jordi";
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Pop_up | null>(null);
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
    setPins(prev => [...prev, newPin]);
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
        // transitionDuration="200"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onMove={(evt) => setViewport(evt.viewState)}
        doubleClickZoom={false}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onDblClick={handleAddEvent}
        // onTouchStart={onTap}
      >
        {pins.map((p: Pin) => (
          <div key={p._id}>
            <Marker longitude={p.long} latitude={p.lat} anchor="bottom">
              <MapMarker color = {p.username == thisUser ? "tomato" : "blue"} zoom={viewport.zoom} onClick={() => handleMarkerClick(p._id, p.lat, p.long)} />
            </Marker>
            {currentPlaceId === p._id && (
              <Popup
                key={p._id}
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentPlaceId(null)}
                anchor="left"
              >
                                <div className="text-base -my-1 flex justify-end flex-col">
                  <h2 className="text-xl font-extrabold">{p.title}</h2>
                  <label className="">Location</label>
                  <h3 className="text-md font-bold">{p.location}</h3>
                  <label className="">Happening at</label>
                  <h3 className="text-md font-bold">{p.date.toString()}</h3>
                  <label>Description</label>
                  <p>{p.description}</p>
                  {/* <label >Information</label> */}
                  <small>
                    Created by <strong>{p.username}</strong>,{" "}
                    <em className="text-slate-500">
                      {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </em>
                  </small>
                </div>
              </Popup>
            )}
          </div>
        ))}
        
        {newEvent && <Popup latitude={newEvent.lat} closeButton={true} onClose={() => setNewEvent(null)} longitude={newEvent.long}><Form coordinates={{lat: newEvent.lat, long: newEvent.long}} onSuccess={handleNewPin} /></Popup>}
      </Map>
    </div>
  );
}

export default App;
