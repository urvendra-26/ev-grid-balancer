import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function PredictionChart({ prediction }) {
  const data = {
    labels: prediction.map(p => p.hour),
    datasets: [{
      label: "Predicted Load",
      data: prediction.map(p => p.load),
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      tension: 0.4,
      pointRadius: 3
    }]
  };

  return (
    <div className="card">
      <h2>Grid Load Prediction</h2>
      <Line data={data} />
    </div>
  );
}
