"use client";
import { useState, useEffect } from "react";
import Chart from "chart.js/auto";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [visualizationType, setVisualizationType] = useState("bar");
  const [data, setData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Use effect to generate the chart once the data is available
  useEffect(() => {
    if (data) {
      generateChart(visualizationType, data);
    }
  }, [data, visualizationType]);

  // Use effect to start and stop the timer
  useEffect(() => {
    let timer;
    if (loading && startTime) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading, startTime]);

  // Handle Code 1 submission to fetch visualization as an image
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setStartTime(Date.now());
    setTimeElapsed(0);

    try {
      // Make the request to the FastAPI backend (code-to-visualization endpoint)
      const response = await fetch(
        `http://localhost:8000/code-to-visualization?question=${question}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Error generating visualization");
      }

      // Convert the image response to a blob
      const blob = await response.blob();

      // Create an object URL from the blob and set it as the image URL
      const imageUrl = URL.createObjectURL(blob);
      setImageUrl(imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Code 2 submission to fetch data and create a visualization
  const handleDataSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    setStartTime(Date.now());
    setTimeElapsed(0);

    try {
      // Make the request to the FastAPI backend (ask-sql-chain endpoint)
      const response = await fetch(
        `http://127.0.0.1:8000/ask-sql-chain/?question=${encodeURIComponent(
          question
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Error fetching the SQL result");
      }

      // Get the JSON result from the API response
      const result = await response.json();
      setData(result.result.result); // Set the result array object
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = (chartType, chartData) => {
    const ctx = document.getElementById("chartCanvas")?.getContext("2d");

    // Check if the canvas element exists before proceeding
    if (!ctx) return;

    // Remove existing chart if present
    if (window.myChart) {
      window.myChart.destroy();
    }

    // Generate the chart based on type
    window.myChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: Object.keys(chartData[0]),
        datasets: [
          {
            label: "Result",
            data: chartData.map((row) => Object.values(row)[0]),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">NLB-QS</h1>
      <p className="text-lg text-gray-600 mb-8">
        Ask any question related to the data, and we'll generate a visualization for you!
      </p>

      {/* Form for Code 1 */}
      <h2 className="text-3xl font-semibold text-red-500 mb-4">Generate Visualization as Image</h2>
      <form onSubmit={handleImageSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full p-3 border border-blue-500 rounded-lg"
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg ${loading ? "opacity-50" : ""}`}
          disabled={loading}
        >
          {loading ? "Generating Image..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Your Visualization as Image</h2>
          <img
            src={imageUrl}
            alt="Generated visualization"
            className="max-w-full h-auto mt-4 shadow-lg rounded-lg"
          />
        </div>
      )}

      {/* Timer between Code 1 and Code 2 */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-green-500">Time Elapsed: {timeElapsed} seconds</h3>
      </div>

      {/* Form for Code 2 */}
      <h2 className="text-3xl font-semibold text-purple-500 mt-12 mb-4">Generate Visualization with Chart</h2>
      <form onSubmit={handleDataSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full p-3 border border-purple-500 rounded-lg"
        />

        <div className="flex flex-col space-y-2 items-start">
          <label htmlFor="visualizationType" className="font-semibold text-gray-700">Select Visualization Type:</label>
          <select
            id="visualizationType"
            value={visualizationType}
            onChange={(e) => setVisualizationType(e.target.value)}
            className="p-3 border border-purple-500 rounded-lg"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
          </select>
        </div>

        <button
          type="submit"
          className={`bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg ${loading ? "opacity-50" : ""}`}
          disabled={loading}
        >
          {loading ? "Fetching Data..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {data && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Visualization</h2>
          <canvas id="chartCanvas" className="max-w-full h-auto mt-4"></canvas>
        </div>
      )}
    </div>
  );
}
