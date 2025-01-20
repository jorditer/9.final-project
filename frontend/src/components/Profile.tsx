import EventProps from "../interfaces/EventsProps";

const Profile: React.FC<EventProps> = ({ showProfile }) => {
  return (
    <div
      className={`fixed mx-2 bottom-2 w-[calc(100%-1rem)] h-1/3 bg-white transition-all duration-700 ease-in-out transform ${
        showProfile ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    ></div>
  );
};

export default Profile;
