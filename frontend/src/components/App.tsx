import { useState, useEffect } from "react";
import Register from "./Register";
import MapView from "./MapView";
import BackgroundMap from "./BackgroundMap";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router";
import Login from "./Login";
import { ProfileImagesProvider } from "../context/ProfileImagesContext";
import { authService } from "../services/auth";
import api from "../services/api";
import { FriendsProvider } from "../context/FriendsContext";

function App() {
  const [thisUser, setThisUser] = useState<string | null>(authService.getUser());

  // Effect to handle initial route protection
  useEffect(() => {
    if (!authService.isAuthenticated() && window.location.pathname === '/') {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        performLogout();
        return;
      }
  
      await api.post('/users/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      performLogout();
    } catch (error) {
      console.error('Logout error:', error);
      performLogout();
    }
  };

  const performLogout = () => {
    authService.clearAuth();
    setThisUser(null);
    window.location.href = '/login';
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    
    if (!authService.isAuthenticated() && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  // If we're on a login-related route, show the background map

                           return (
                            <BrowserRouter>
                              <FriendsProvider thisUser={thisUser}>
                                <ProfileImagesProvider>
                                  <div className="h-lvh w-lvw relative">
                                    {/* Background map container */}
                                    <div className="fixed inset-0">
                                      <BackgroundMap />
                                    </div>
                        
                                    {/* Main content container */}
                                    <div className="relative h-full w-full">
                                      {/* Show MapView only when authenticated */}
                                      {thisUser && <MapView thisUser={thisUser} onLogout={handleLogout} />}
                        
                                      {/* Auth routes with proper centering */}
                                      <Routes>
                                        <Route 
                                          path="/login" 
                                          element={
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                              <Login setThisUser={setThisUser} />
                                            </div>
                                          } 
                                        />
                                        <Route 
                                          path="/signup" 
                                          element={
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                              <Register setThisUser={setThisUser} />
                                            </div>
                                          } 
                                        />
                                        <Route 
                                          path="/" 
                                          element={
                                            <ProtectedRoute>
                                              <></>
                                            </ProtectedRoute>
                                          } 
                                        />
                                      </Routes>
                                    </div>
                                  </div>
                                </ProfileImagesProvider>
                              </FriendsProvider>
                            </BrowserRouter>
                          );
}

export default App;