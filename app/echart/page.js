"use client";
import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react"; // Import ECharts for React

export default function Home() {
  const [question, setQuestion] = useState("");
  const [visualizationType, setVisualizationType] = useState("bar");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle chart generation when data changes
  useEffect(() => {
    if (data) {
      generateChartOptions(visualizationType, data);
    }
  }, [data, visualizationType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ask/?question=${encodeURIComponent(question)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching the SQL result");
      }

      const result = await response.json();
      setData(result.result); // Save the result for visualization
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart options dynamically based on type and SQL result data
  const generateChartOptions = (chartType, chartData) => {
    const keys = Object.keys(chartData[0]);
    const labels = chartData.map((row) => row[keys[0]]);
    const values = chartData.map((row) => row[keys[1]]);

    // Return chart options dynamically based on type
    switch (chartType) {
      case "bar":
        return {
          title: { text: "Bar Chart Visualization" },
          tooltip: {},
          xAxis: { data: labels },
          yAxis: {},
          series: [
            {
              type: "bar",
              data: values,
              itemStyle: { color: "#3b82f6" }, // Slightly dark blue color
            },
          ],
        };
      case "line":
        return {
          title: { text: "Line Chart Visualization" },
          tooltip: {},
          xAxis: { data: labels },
          yAxis: {},
          series: [
            {
              type: "line",
              data: values,
              smooth: true,
              itemStyle: { color: "#2563eb" }, // Darker blue line color
            },
          ],
        };
      case "pie":
        return {
          title: { text: "Pie Chart Visualization" },
          tooltip: { trigger: "item" },
          series: [
            {
              type: "pie",
              radius: "50%",
              data: labels.map((label, index) => ({
                name: label,
                value: values[index],
              })),
              itemStyle: {
                color: (params) => [
                  "#2563eb", // Dark blue shades
                  "#3b82f6",
                  "#93c5fd",
                ][params.dataIndex % 3],
              },
            },
          ],
        };
      default:
        return {};
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-500">
        SQL RESULT DATA TO VISUALIZATION
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none focus:border-blue-600"
        />

        <select
          id="visualizationType"
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value)}
          className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none focus:border-blue-600"
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>

        <button
          type="submit"
          className={`px-8 py-3 text-lg font-bold text-white rounded-md transition ${
            loading ? "bg-blue-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
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
          <ReactECharts option={generateChartOptions(visualizationType, data)} />
        </div>
      )}
    </div>
  );
}
