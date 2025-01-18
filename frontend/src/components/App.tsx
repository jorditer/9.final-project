// src/App.tsx
import { useState } from "react";
import Register from "./Register";
import MapView from "./MapView";
import { Navigate, BrowserRouter, Routes, Route } from "react-router";
import Login from "./Login";


function App() {
  const [thisUser, setThisUser] = useState<string | null>("Jordi");
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!thisUser) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };
  return (
		<BrowserRouter>
    <div className="h-lvh w-lvw">
			<Routes>
				<Route path="/login" element={<Login setThisUser={setThisUser} />} />
      {/* <MapView thisUser={thisUser} /> */}
      <Route path="/signup" element={<Register setThisUser={setThisUser}/>} />
			<Route path="/" element={
            <ProtectedRoute>
              <MapView 
                thisUser={thisUser} 
                onLogout={() => setThisUser(null)}
              />
            </ProtectedRoute>
          } />
			</Routes>
    </div>
		</BrowserRouter>
  );
}

export default App;