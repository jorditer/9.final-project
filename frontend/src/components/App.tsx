import { useState, useEffect } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router";
import Login from "./Login";
import { ProfileImagesProvider } from "../context/ProfileImagesContext";
import { authService } from "../services/auth";
import api from "../services/api";

function App() {
  const [thisUser, setThisUser] = useState<string | null>(authService.getUser());

  const handleLogout = async () => {
    try {
      // First, tell the server we're logging out so it can invalidate the refresh token
      await api.post('/api/users/logout');
      
      // Clear all authentication data from the browser
      authService.clearAuth();
      
      // Update application state
      setThisUser(null);
    } catch (error) {
      // Even if the server request fails, we should still clear local auth state
      console.error('Logout error:', error);
      authService.clearAuth();
      setThisUser(null);
    }
  };

  // This component protects routes that require authentication
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    
    // Use our auth service to check if user is authenticated
    if (!authService.isAuthenticated() && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  // This component handles the auth overlay for login/register pages
  const AuthOverlay = () => {
    const location = useLocation();
    const showOverlay = location.pathname === '/login' || location.pathname === '/signup';
    
    if (!showOverlay) return null;
    if (authService.isAuthenticated() && showOverlay) {
      return <Navigate to="/" replace />;
    }
    
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