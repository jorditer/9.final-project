import { useState } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { Navigate, BrowserRouter, Routes, Route, useLocation } from "react-router";
import Login from "./Login";

function App() {
  const myStorage = window.localStorage;
  const [thisUser, setThisUser] = useState<string | null>(myStorage.getItem("user"));

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!thisUser) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  const handleLogout = () => {
    setThisUser(null);
    myStorage.removeItem("user");
  };

  const AuthOverlay = () => {
    const location = useLocation();
    const showOverlay = location.pathname === '/login' || location.pathname === '/signup';
    
    if (!showOverlay) return null;
    
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <Routes>
            <Route path="/login" element={<Login setThisUser={setThisUser} />} />
            <Route path="/signup" element={<Register setThisUser={setThisUser} />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <div className="h-lvh w-lvw relative">
        <MapView thisUser={thisUser} onLogout={handleLogout} />
        <AuthOverlay />
        <Routes>
          <Route path="/" element={null} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;