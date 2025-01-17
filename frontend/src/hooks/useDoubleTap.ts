import { useState, useRef, useCallback } from "react";
import { MapTouchEvent } from 'react-map-gl'

// interface MapTouchEvent extends Object {
//   preventDefault(): void;
//   originalEvent(): void;
// }

const useDoubleTap = (onDoubleTap: (event: MapTouchEvent) => void, delay = 300) => {
  const [lastTap, setLastTap] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleTap = useCallback((event: MapTouchEvent) => {
    event.preventDefault(); // Prevent default touch behavior
    event.originalEvent.stopPropagation(); // Stop event bubbling
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    clearTimeout(timeoutRef.current!);

    if (tapLength < delay && tapLength > 0) {
      onDoubleTap(event);
      setLastTap(0);
    } else {
      setLastTap(currentTime);
      timeoutRef.current = setTimeout(() => {
        setLastTap(0);
      }, delay);
    }
  }, [onDoubleTap, lastTap, delay]);

  return handleTap;
};

export default useDoubleTap;