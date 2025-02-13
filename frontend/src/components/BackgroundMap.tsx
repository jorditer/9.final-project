import Map from "react-map-gl";

const BackgroundMap = () => {
  return (
    <Map
      initialViewState={{
        latitude: 41.38879,
        longitude: 2.15899,
        zoom: 12,
      }}
      style={{ width: "100%", height: "100%" }}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      interactive={false}
      dragPan={false}    
      dragRotate={false} 
      scrollZoom={false} 
      doubleClickZoom={false} // Disable zoom on double click
    />
  );
};

export default BackgroundMap;