import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(res => {
        if (res.ok) setAuthenticated(true);
        else setAuthenticated(false);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) return <p>Loading...</p>;
  return authenticated ? children : <Navigate to="/login" />;
}
