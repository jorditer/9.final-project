import { useState, useEffect } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router";
import Login from "./Login";
import { ProfileImagesProvider } from "../context/ProfileImagesContext";
import { authService } from "../services/auth";
import api from "../services/api";
import { FriendsProvider } from "../context/FriendsContext";

function App() {
  const [thisUser, setThisUser] = useState<string | null>(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleLogout = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        authService.clearAuth();
        setThisUser(null);
        setIsAuthenticated(false);
        return;
      }
  
      await api.post('/users/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearAuth();
      setThisUser(null);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (username: string) => {
    setThisUser(username);
    setIsAuthenticated(true);
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    
    if (!isAuthenticated && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <FriendsProvider thisUser={thisUser}>
        <ProfileImagesProvider>
          <div className="h-lvh w-lvw relative">
            {isAuthenticated && <MapView thisUser={thisUser} onLogout={handleLogout} />}
            <Routes>
              <Route path="/login" element={<Login setThisUser={handleLogin} />} />
              <Route path="/signup" element={<Register setThisUser={handleLogin} />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <></>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </ProfileImagesProvider>
      </FriendsProvider>
    </BrowserRouter>
  );
}

export default App;