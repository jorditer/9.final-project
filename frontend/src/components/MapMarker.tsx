const MapMarker = ({ color = '#FF0000', zoom }: { color?: string; zoom: number }) => {
	console.log(zoom);
	return (
		<svg 
			viewBox="0 0 24 36" 
			fill="none" 
			xmlns="http://www.w3.org/2000/svg"
			className="h-6 w-8"
      style={{
        width: `${zoom * 9}px`, //When you zoom it gets bigger
        height: `${zoom * 9 }px`
      }}
		>
			<path 
				d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
				fill={color}
			/>
		</svg>
	);
};

export default MapMarker;