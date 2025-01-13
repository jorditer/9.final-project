// import { useState } from 'react'
// import pinIcon from "../assets/imgs/pin.svg";
import MapMarker from './MapMarker'
import Map, { Marker, Popup } from "react-map-gl";
import "../index.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";

import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({
    
    latitude: 41.38879,
    longitude: 2.15899,
    zoom: 12,
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pins"); // Used proxy in package.json so no need for full url
        setPins(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);
  const handleMarkerClick = (id:string, lat:number, long:number): void => {
    setCurrentPlaceId(id);
    setViewport(prev => ({
    ...prev,
    latitude: lat,
    longitude: long,
  }));
  };

  return (
    <div className="h-lvh w-lvw">
      <Map
        // style={{ width: "100%", height: "100%" }}
        {...viewport}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {pins.map((p: Pin) => (
          <div key={p._id}>
            <Marker onClick={() => setShowPopup((prev) => !prev)} longitude={p.long} latitude={p.lat} anchor="bottom">
              <MapMarker color='blue' zoom={viewport.zoom} onClick={() => handleMarkerClick(p._id, p.lat, p.long)} />
              </Marker>
            {showPopup && (
              <Popup longitude={p.long} latitude={p.lat} className="" anchor="left" onClose={() => setShowPopup(false)}>
                <div className="text-base -my-1 flex justify-end flex-col">
                  <h2 className="text-xl font-extrabold">{p.title}</h2>
                  <label className="">Place</label>
                  <h3 className="text-md font-bold">{p.location}</h3>
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
      </Map>
      ;
    </div>
  );
}

export default App;
