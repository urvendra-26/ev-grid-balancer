import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // If user does not exist OR invalid credential → try signup
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (signupErr) {
          if (signupErr.code === "auth/email-already-in-use") {
            setError("Incorrect password for this email");
          } else {
            setError(signupErr.message);
          }
        }
      }
      else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      }
      else {
        setError(err.message);
      }
    }
  };


  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>⚡ EV‑Grid Balancer</h1>
        <p>Smart EV charging for a sustainable grid</p>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={login}>
          Login / Sign Up
        </button>

        <p style={styles.footer}>Powered by Firebase & Google AI</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "40px",
    borderRadius: "18px",
    width: "320px",
    textAlign: "center",
    backdropFilter: "blur(10px)"
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "10px",
    border: "none",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    background: "#00ffcc",
    fontWeight: "bold"
  },
  error: {
    color: "#ff8080",
    fontSize: "14px",
    marginTop: "10px"
  },
  footer: {
    marginTop: "20px",
    fontSize: "12px",
    opacity: 0.8
  }
};