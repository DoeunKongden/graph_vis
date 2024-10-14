"use client";
import { useState, useEffect } from "react";
import Chart from "chart.js/auto";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [visualizationType, setVisualizationType] = useState("bar");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle chart generation when data changes
  useEffect(() => {
    if (data) {
      generateChart(visualizationType, data);
    }
  }, [data, visualizationType]);

  // Submit the question and fetch data from backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ask/?question=${encodeURIComponent(
          question
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching the SQL result");
      }

      const result = await response.json();
      console.log("result:", result);

      // Set the result array object (the 'result.result' part of the response)
      setData(result.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = (chartType, chartData) => {
    const ctx = document.getElementById("chartCanvas")?.getContext("2d");

    if (!ctx) return;

    // Destroy the previous chart instance if it exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    const keys = Object.keys(chartData[0]);
    const labels = chartData.map((row) => row[keys[0]]);
    const values = chartData.map((row) => row[keys[1]]);

    const darkBlueColors = [
      'rgba(41, 98, 255, 0.8)',   // Vivid dark blue
      'rgba(21, 67, 96, 0.8)',    // Deep ocean blue
      'rgba(33, 150, 243, 0.8)',  // Lighter blue
      'rgba(2, 119, 189, 0.8)',   // Medium blue
      'rgba(0, 77, 153, 0.8)',    // Darker navy blue
    ];

    const borderBlue = 'rgba(13, 71, 161, 1)'; // Blue border color

    window.myChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: keys[1],
            data: values,
            backgroundColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? darkBlueColors
                : darkBlueColors[0], // Single color for bar/line charts
            borderColor: borderBlue,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales:
          chartType === 'pie' || chartType === 'doughnut'
            ? {} // No scales for pie/doughnut charts
            : {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(144, 164, 174, 0.3)', // Soft grid color
                },
                ticks: {
                  color: 'rgba(13, 71, 161, 1)', // Axis text color
                },
              },
              x: {
                grid: {
                  color: 'rgba(144, 164, 174, 0.3)',
                },
                ticks: {
                  color: 'rgba(13, 71, 161, 1)',
                },
              },
            },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(13, 71, 161, 1)', // Legend text color
            },
          },
        },
      },
    });
  };





  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-500">
        SQL RESULT DATA TO VISUALIZATION
      </h1>
      <p className="text-lg text-gray-600 mb-8">

      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
        <input
          type="text"
          id="question"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none focus:border-blue-600"
        />

        <div className="w-full">
          <label htmlFor="visualizationType" className="block mb-2 text-lg font-medium text-gray-700">
            Select Visualization Type:
          </label>
          <select
            id="visualizationType"
            value={visualizationType}
            onChange={(e) => setVisualizationType(e.target.value)}
            className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none focus:border-blue-600"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
          </select>
        </div>

        <button
          type="submit"
          className={`px-8 py-3 text-lg font-bold text-white rounded-md focus:outline-none transition ${loading ? "bg-blue-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          disabled={loading}
        >
          {loading ? "Fetching Data..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {data && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Visualization</h2>
          <canvas id="chartCanvas" className="mx-auto w-full h-96"></canvas>
        </div>
      )}
    </div>
  );
}
