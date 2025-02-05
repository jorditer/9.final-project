import { useState, useRef, useCallback } from "react";
import { Calendar, Pencil } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Pin from "../interfaces/Pin";

interface TimeProps {
  pin: Pin;
  isOwner: boolean;
  updatePinDate: (pinId: string, date: Date) => Promise<Pin>;
}

/**
 * Time component that displays and allows editing of a pin's date/time.
 * Features include:
 * - Toggle between calendar and pencil icons based on icon hover
 * - Date/time editing for pin owners
 * - Google Calendar integration
 * - Responsive display of date information
 */
const Time: React.FC<TimeProps> = ({ pin, isOwner, updatePinDate }) => {
  // Combined state object to manage all editing-related states
  const [editState, setEditState] = useState<{
    isEditing: boolean;
    isHovering: boolean;
    pendingDate: Date | null;
  }>({
    isEditing: false,
    isHovering: false,
    pendingDate: null,
  });
  
  // Refs for DOM element access and event handling
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Initiates the editing mode and sets up necessary event listeners
   */
  const startEditing = useCallback(() => {
    if (!isOwner) return;
    
    setEditState(prev => ({ ...prev, isEditing: true }));
    
    setTimeout(() => {
      // Open the native datetime picker
      inputRef.current?.showPicker();
      
      // Set up document-level click handler for detecting clicks outside
      const handleDocumentClick = (e: MouseEvent) => {
        // Close editing mode if click is outside the component
        if (!containerRef.current?.contains(e.target as Node)) {
          cancelEdit();
          document.removeEventListener('click', handleDocumentClick);
        }
      };
      
      // Small delay to prevent the handler from triggering immediately
      setTimeout(() => {
        document.addEventListener('click', handleDocumentClick);
      }, 100);
    }, 0);
  }, [isOwner]);

  const hoverRef = useRef(false);


  /**
   * Resets all editing-related state to their default values
   */
  const cancelEdit = useCallback(() => {
    setEditState({
      isEditing: false,
      isHovering: false,
      pendingDate: null,
    });
  }, []);

  /**
   * Saves the pending date changes and exits edit mode
   */
  const confirmEdit = async () => {
    if (editState.pendingDate) {
      try {
        await updatePinDate(pin._id, editState.pendingDate);
        cancelEdit();
      } catch (err) {
        console.error("Failed to update date:", err);
      }
    }
  };

  /**
   * Formats a date for the datetime-local input
   */
  const formatForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  /**
   * Formats a date into a relative time string (e.g., "2 hours ago")
   */
  const formatTimeDistance = (date: Date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true });
    return distance.replace(/about /, '');
  };

  /**
   * Creates a Google Calendar event URL with the pin's details
   */
  const createGoogleCalendarUrl = (eventDate: Date) => {
    const startDate = new Date(eventDate);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1); // 1hour default

    const formatForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    url += `&text=${encodeURIComponent(pin.title || 'Untitled Event')}`;
    url += `&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}`;
    
    if (pin.lat && pin.long) {
      const coordinates = `${pin.lat},${pin.long}`;
      url += `&location=${encodeURIComponent(coordinates)}`;
    }
    
    const fullDescription = [
      pin.description,
      `<b>Location:</b> ${pin.location}`,
      pin.lat && pin.long ? `<b>Maps Link:</b> <a>https://www.google.com/maps?q=${pin.lat},${pin.long}</a>` : null
    ].filter(Boolean).join('\n\n');
    
    url += `&details=${encodeURIComponent(fullDescription)}`;
    return url;
  };

  /**
   * Handles changes to the datetime input
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      cancelEdit();
      return;
    }
    setEditState(prev => ({
      ...prev,
      pendingDate: new Date(e.target.value)
    }));
  };

  /**
   * Handles clicks on the time display
   */
  const handleTimeClick = () => {
    if (!editState.isEditing) {
      window.open(createGoogleCalendarUrl(editState.pendingDate || pin.date), '_blank');
    }
  };

  // Determine which icon to show based on component state

  return (
    <div 
      ref={containerRef}
      className="flex items-center space-x-2 rounded-lg w-full datetime-picker-container relative"
    >
      <div className="relative group/calendar">
  <div 
    className={`w-5 h-5 text-gray-600 flex-shrink-0 ${
      isOwner && 'cursor-pointer hover:text-dark'
    }`}
    onClick={startEditing}
  >
    <Calendar className={`absolute ${isOwner ? 'group-hover/calendar:opacity-0' : ''} ${editState.pendingDate ? 'opacity-0' : ''}`} size={20} />
    {isOwner && <Pencil className={`absolute opacity-0 ${editState.pendingDate ? 'opacity-100' : 'group-hover/calendar:opacity-100'}`} size={20} />}
  </div>
</div>

      
      {/* Date and time display */}
      <div 
        className="flex flex-col min-w-0 flex-1 cursor-pointer hover:text-blue-600"
        onClick={handleTimeClick}
        title="Click to add to Google Calendar"
      >
        <span className={`text-sm font-medium truncate`}>
          <span className={`${editState.pendingDate ? 'hidden' : 'hidden sm:inline'}`}>
            {format(new Date(editState.pendingDate || pin.date), "EEEE, ")}
          </span>
          {format(new Date(editState.pendingDate || pin.date), "MMMM d")}
        </span>
        <div className="flex items-center space-x-2 text-xs">
        <span className="text-gray-600 underline flex-shrink-0">
  {format(new Date(editState.pendingDate || pin.date), "h:mm a")}
</span>
          <em className={`text-gray-500 text-nowrap ${editState.pendingDate ? 'hidden' : 'hidden sm:inline'}`}>
            ({formatTimeDistance(pin.date)})
          </em>
        </div>
      </div>

      {/* Confirmation buttons shown when there's a pending date change */}
      {editState.pendingDate && (
        <div className="absolute right-0 top-0 flex items-center space-x-2">
          <button 
            onClick={confirmEdit}
            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
            title="Confirm"
          >
            ✓
          </button>
          <button 
            onClick={cancelEdit}
            className="px-1.5 rounded-xl text-red-600 hover:bg-red-50 text-lg"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden datetime input that appears when editing */}
      {editState.isEditing && (
        <input
          ref={inputRef}
          type="datetime-local"
          className="hidden"
          value={formatForInput(editState.pendingDate || pin.date)}
          min={formatForInput(new Date())}
          onChange={handleDateChange}
          onBlur={(e) => {
            if (!e.relatedTarget?.closest('.datetime-picker-container')) {
              cancelEdit();
            }
          }}
        />
      )}
    </div>
  );
};

export default Time;