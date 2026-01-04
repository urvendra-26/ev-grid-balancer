import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// Highlight icon
const greenIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",
  iconSize: [32, 32]
});

export default function ChargingStationsMap({ gridLoad, onReward }) {
  const [stations, setStations] = useState([]);
  const [position, setPosition] = useState([18.5204, 73.8567]); // Pune
  const [bestStationId, setBestStationId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);
        fetchStations(lat, lon);
      },
      () => fetchStations(position[0], position[1])
    );
  }, []);

  const fetchStations = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=10&distanceunit=KM`
      );

      if (!res.ok) throw new Error("API blocked");

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No data");
      }

      setStations(data);

      if (gridLoad === "LOW") {
        setBestStationId(data[0].ID);
      }
    } catch (err) {
      console.warn("Using fallback EV stations (API blocked)");

      // ✅ FALLBACK DEMO DATA (IMPORTANT)
      const fallbackStations = [
        {
          ID: 1,
          AddressInfo: {
            Title: "Demo EV Charging Station",
            AddressLine1: "Solar EV Hub, Pune",
            Latitude: position[0],
            Longitude: position[1]
          }
        }
      ];

      setStations(fallbackStations);
      setBestStationId(1);
      setError(true);
    }
  };

  const handleStationClick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newPoints = onReward.points + 5;
    const newCo2 = Number((onReward.co2 + 0.3).toFixed(2));

    await updateDoc(doc(db, "users", user.uid), {
      points: newPoints,
      co2_saved: newCo2
    });

    onReward.setPoints(newPoints);
    onReward.setCo2(newCo2);
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={{ textAlign: "center", color: "white" }}>
        📍 Nearby EV Charging Stations
      </h2>

      <p style={{ textAlign: "center", color: "#00ffcc" }}>
        {error
          ? "Demo stations shown (API restricted)"
          : gridLoad === "LOW"
          ? "Best station highlighted (Low Grid Load)"
          : "Grid busy — charging discouraged"}
      </p>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map(s => (
          <Marker
            key={s.ID}
            position={[
              s.AddressInfo.Latitude,
              s.AddressInfo.Longitude
            ]}
            icon={s.ID === bestStationId ? greenIcon : undefined}
          >
            <Popup>
              <strong>{s.AddressInfo.Title}</strong>
              <br />
              {s.AddressInfo.AddressLine1}
              <br /><br />
              <button onClick={handleStationClick}>
                Select This Station (+5 pts)
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
