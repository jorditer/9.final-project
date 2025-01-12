// import { useState } from 'react'
import pinIcon from "../assets/imgs/pin2.svg";
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

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pins"); // Used proxy in package.json so no need for full url
        setPins(res.data.data);
        // console.log("Response" + res);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);
  // console.log(pins);

  return (
    <div className="h-lvh w-lvw">
      <Map
        // style={{ width: "100%", height: "100%" }}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 17,
          latitude: 46,
          zoom: 3.5,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {pins.map((p: Pin) => (
          <div key={p._id}>
            <Marker onClick={() => setShowPopup((prev) => !prev)} longitude={p.long} latitude={p.lat} anchor="bottom">
              <img src={pinIcon} alt="pin" className="text-slate-500 w-6 h-6" width="24" />
            </Marker>
            {showPopup && (
              <Popup longitude={p.long} latitude={p.lat} className="" anchor="left" onClose={() => setShowPopup(false)}>
                <div className="text-base -my-1 flex justify-end flex-col">
                  <label className="">Place</label>
                  <h2 className="text-xl font-extrabold">{p.title}</h2>
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
