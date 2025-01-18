import { useState } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { Navigate, BrowserRouter, Routes, Route } from "react-router";
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
  console.log(myStorage.getItem("user"));
  return (
    <BrowserRouter>
      <div className="h-lvh w-lvw">
        <Routes>
          <Route path="/login" element={<Login setThisUser={setThisUser} />} />
          <Route path="/signup" element={<Register setThisUser={setThisUser} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MapView thisUser={thisUser} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
