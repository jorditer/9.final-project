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
      interactive={false}  // Disable map interactions for the login background
      dragPan={false}     // Disable panning
      dragRotate={false}  // Disable rotation
      scrollZoom={false}  // Disable zoom on scroll
      doubleClickZoom={false} // Disable zoom on double click
    />
  );
};

export default BackgroundMap;