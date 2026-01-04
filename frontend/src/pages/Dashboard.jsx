import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import ChargingStationsMap from "../components/ChargingStationsMap";

export default function Dashboard() {
  const [points, setPoints] = useState(null);
  const [co2, setCo2] = useState(null);

  // ML-based states
  const [gridLoad, setGridLoad] = useState("LOW");
  const [aiMessage, setAiMessage] = useState("Loading AI recommendation...");

  // -----------------------------
  // LOAD USER DATA
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const safePoints = Number(data.points ?? 0);
        const safeCo2 = Number(data.co2_saved ?? 0);

        if (data.co2_saved === undefined) {
          await updateDoc(ref, { co2_saved: safeCo2 });
        }

        setPoints(safePoints);
        setCo2(safeCo2);
      } else {
        await setDoc(ref, {
          email: user.email,
          points: 20,
          co2_saved: 1.0
        });
        setPoints(20);
        setCo2(1.0);
      }
    };

    fetchUser();
  }, []);

  // -----------------------------
  // LOAD ML PREDICTION JSON
  // -----------------------------
  useEffect(() => {
    const loadPrediction = async () => {
      try {
        const res = await fetch("/prediction_with_load_levels.json");
        const data = await res.json();

        const currentHour = new Date().getHours();
        const hourData =
          data.find(d => d.hour === currentHour) || data[0];

        setGridLoad(hourData.load_level);

        if (hourData.recommended_for_charging) {
          setAiMessage(
            "Charge Now — Best nearby station highlighted on map"
          );
        } else {
          setAiMessage("Charging Not Recommended Right Now");
        }
      } catch (err) {
        setGridLoad("LOW");
        setAiMessage("Charge Now (Default)");
      }
    };

    loadPrediction();
  }, []);

  // -----------------------------
  // REWARD USER
  // -----------------------------
  const reward = async (p, c) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const newPoints = Number(points) + p;
    const newCo2 = Number((Number(co2) + c).toFixed(2));

    await updateDoc(ref, {
      points: newPoints,
      co2_saved: newCo2
    });

    setPoints(newPoints);
    setCo2(newCo2);
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  if (points === null || co2 === null) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  const disableCharging = gridLoad === "HIGH";

  return (
    <div style={styles.page}>
      <button style={styles.logout} onClick={logout}>Logout</button>

      <h1 style={styles.title}>⚡ EV‑Grid Balancer</h1>
      <p style={styles.subtitle}>
        AI‑driven smart charging for a sustainable grid
      </p>

      <div style={styles.grid}>
        <Card title="🌱 Green‑Charge Points" value={`${points} pts`} />
        <Card title="🌍 CO₂ Saved" value={`${co2} kg`} />
        <Card title="🔋 Grid Load" value={gridLoad} highlight />
      </div>

      <div style={styles.recommend}>
        ✅ AI Recommendation: <strong>{aiMessage}</strong>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.primary}
          disabled={disableCharging}
          onClick={() => reward(10, 0.5)}
        >
          ⚡ Charge Now
        </button>

        <button
          style={styles.secondary}
          disabled={disableCharging}
          onClick={() => reward(15, 1.2)}
        >
          ☀️ Solar Charging
        </button>

        <button
          style={styles.secondary}
          disabled={disableCharging}
          onClick={() => reward(20, 1.5)}
        >
          🤖 AI Recommended
        </button>
      </div>

      {/* 🔥 MAP INTEGRATION (FINAL PART) */}
      <ChargingStationsMap
        gridLoad={gridLoad}
        onReward={{
          points,
          co2,
          setPoints,
          setCo2
        }}
      />
    </div>
  );
}

// -----------------------------
// CARD COMPONENT
// -----------------------------
function Card({ title, value, highlight }) {
  return (
    <div
      style={{
        ...styles.card,
        border: highlight ? "2px solid #00ffcc" : "none"
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    color: "white",
    padding: "30px",
    fontFamily: "Arial"
  },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", opacity: 0.8 },
  logout: {
    position: "absolute",
    right: 20,
    top: 20,
    padding: "8px 14px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "30px"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "16px",
    textAlign: "center"
  },
  recommend: {
    marginTop: "30px",
    padding: "20px",
    background: "rgba(0,255,204,0.15)",
    borderRadius: "12px",
    textAlign: "center"
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "25px"
  },
  primary: {
    padding: "14px 24px",
    background: "#00ffcc",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer"
  },
  secondary: {
    padding: "14px 24px",
    background: "transparent",
    border: "1px solid #00ffcc",
    color: "white",
    borderRadius: "30px",
    cursor: "pointer"
  }
};
