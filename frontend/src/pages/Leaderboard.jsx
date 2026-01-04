import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => d.data()));
    };
    load();
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2>🏆 Green Champions</h2>

      {users.map((u, i) => (
        <div key={i} style={styles.row}>
          <span>#{i + 1}</span>
          <span>{u.email}</span>
          <span>{u.points} pts</span>
          <span>{u.co2_saved} kg CO₂</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: {
    margin: "30px",
    padding: "20px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    color: "white",
    minHeight: "20px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 3fr 2fr 2fr",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  }
};
