import EventProps from "../interfaces/EventsProps";

const Events: React.FC<EventProps> = ({ showEvents }) => {
  return (
    <div
      className={`fixed bottom-2 w-full h-1/3 bg-white transition-all duration-700 ease-in-out transform z-10 ${
        showEvents ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    ></div>
  );
};

export default Events;
