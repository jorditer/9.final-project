import { useState } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router";
import Login from "./Login";
import { ProfileImagesProvider } from "../context/ProfileImagesContext";

function App() {
  const myStorage = window.localStorage;
  const [thisUser, setThisUser] = useState<string | null>(myStorage.getItem("user"));

  const handleLogout = () => {
    setThisUser(null);
    myStorage.removeItem("user");
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    if (!thisUser && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  const AuthOverlay = () => {
    const location = useLocation();
    const showOverlay = location.pathname === '/login' || location.pathname === '/signup';
    
    if (!showOverlay) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-10">
        <Routes>
          <Route path="/login" element={<Login setThisUser={setThisUser} />} />
          <Route path="/signup" element={<Register setThisUser={setThisUser} />} />
        </Routes>
      </div>
    );
  };

  return (
    <ProfileImagesProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <div className="h-lvh w-lvw relative">
              <MapView thisUser={thisUser} onLogout={handleLogout} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <div className="h-lvh w-lvw relative">
            <MapView thisUser={null} onLogout={handleLogout} />
            <AuthOverlay />
          </div>
        } />
      </Routes>
    </BrowserRouter>
    </ProfileImagesProvider>
  );
}

export default App;