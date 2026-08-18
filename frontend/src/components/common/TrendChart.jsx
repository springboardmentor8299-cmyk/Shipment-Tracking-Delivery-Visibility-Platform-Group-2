import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TrendChart({ title, type = "line", labels = [], datasets = [], height = 260 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { family: "Inter, system-ui, sans-serif", size: 12, weight: 600 },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const chartData = {
    labels: labels.length > 0 ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: datasets.length > 0 ? datasets : [
      {
        label: "Shipments Volume",
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
      }}
    >
      {title && <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>{title}</h3>}
      <div style={{ height: `${height}px`, width: "100%" }}>
        {type === "bar" ? <Bar data={chartData} options={options} /> : <Line data={chartData} options={options} />}
      </div>
    </div>
  );
}

export default TrendChart;
