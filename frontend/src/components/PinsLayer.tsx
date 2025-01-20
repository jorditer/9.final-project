import { Marker, Popup } from "react-map-gl";
import MapMarker from "./MapMarker";
import Pin from "../interfaces/Pin";
import { format, formatDistanceToNow } from "date-fns";
import Time from "./Time";
import { Trash2 } from "lucide-react";
import axios from "axios";

interface PinsLayerProps {
  pins: Pin[];
  currentPlaceId: string | null;
  thisUser: string | null;
  viewport: {
    zoom: number;
  };
  onMarkerClick: (id: string, lat: number, long: number) => void;
  onPopupClose: () => void;
  setPins: (pins: Pin[]) => void;
}

const PinsLayer = ({ 
  pins, 
  currentPlaceId, 
  thisUser, 
  viewport, 
  onMarkerClick, 
  onPopupClose,
  setPins
}: PinsLayerProps) => {
  const handleDelete = async (pinId: string) => {
    try {
      await axios.delete(`/api/pins/${pinId}`);
      setPins(pins.filter(pin => pin._id !== pinId));
      onPopupClose(); // Close the popup after deletion
    } catch (err) {
      console.error('Error deleting pin:', err);
    }
  };

  return (
    <div className="">
      {pins.map((p: Pin) => (
        <div key={p._id}>
          <Marker longitude={p.long} latitude={p.lat} anchor="bottom">
            <MapMarker 
              color={p.username === thisUser ? "tomato" : "blue"} 
              zoom={viewport.zoom} 
              onClick={() => onMarkerClick(p._id, p.lat, p.long)} 
            />
          </Marker>
          
          {currentPlaceId === p._id && (
            <Popup
              key={p._id}
              latitude={p.lat}
              longitude={p.long}
              closeButton={true}
              closeOnClick={false}
              onClose={onPopupClose}
              anchor="left"
            >
              <div className="text-base -my-1 flex justify-end flex-col relative">
                {p.username === thisUser && (
                  <button
                    onClick={() => handleDelete(p._id)}
                    className=" fixed -right-[2px] top-6 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
                <h2 className="text-xl font-extrabold pr-8">{p.title}</h2>
                <label className="">Location</label>
                <h3 className="text-md font-bold">{p.location}</h3>
                <label>Description</label>
                <p>{p.description}</p>
                <h3 className="text-md ">{<Time date={p.date}/>}</h3>
                <small className="text-nowrap">
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
    </div>
  );
};

export default PinsLayer;