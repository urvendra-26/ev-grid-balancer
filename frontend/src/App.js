import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  return user ? (
    <div style={{ background: "#0f2027" }}>
      <Dashboard />
      <Leaderboard />
    </div>
  ) : (
    <Login />
  );
}
