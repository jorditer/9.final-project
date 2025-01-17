import { Marker, Popup } from "react-map-gl";
import MapMarker from "./MapMarker";
import Pin from "../interfaces/Pin";
import { formatDistanceToNow } from "date-fns";

interface PinsLayerProps {
  pins: Pin[];
  currentPlaceId: string | null;
  thisUser: string | null;
  viewport: {
    zoom: number;
  };
  onMarkerClick: (id: string, lat: number, long: number) => void;
  onPopupClose: () => void;
}

const PinsLayer = ({ 
  pins, 
  currentPlaceId, 
  thisUser, 
  viewport, 
  onMarkerClick, 
  onPopupClose 
}: PinsLayerProps) => {
  return (
    <>
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
              <div className="text-base -my-1 flex justify-end flex-col">
                <h2 className="text-xl font-extrabold">{p.title}</h2>
                <label className="">Location</label>
                <h3 className="text-md font-bold">{p.location}</h3>
                <label className="">Happening at</label>
                <h3 className="text-md font-bold">{formatDistanceToNow(new Date (p.date), {addSuffix: true})}</h3>
                <label>Description</label>
                <p>{p.description}</p>
                <small className=" text-nowrap">
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
    </>
  );
};

export default PinsLayer;