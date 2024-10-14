"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [dbCredentials, setDbCredentials] = useState({
    dbType: "postgresql",
    user: "",
    password: "",
    host: "",
    database: "",
  });
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const [question, setQuestion] = useState("");
  const [visualizationType, setVisualizationType] = useState("bar");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle database connection with query parameters
  const handleConnectDb = async (e) => {
    e.preventDefault();
    setConnectionError(null);
    try {
      const url = `http://127.0.0.1:8000/connect_db?db_type=${dbCredentials.dbType}&user=${dbCredentials.user}&password=${dbCredentials.password}&host=${dbCredentials.host}&database=${dbCredentials.database}`;

      const response = await fetch(url, {
        method: "POST", // Send as a POST request but with query parameters
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the database.");
      }

      setConnected(true); // Successfully connected
    } catch (err) {
      setConnectionError(err.message);
    }
  };

  // Handle question submission and fetch the image visualization
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/code-to-visualization?question=${encodeURIComponent(
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
        throw new Error("Error generating visualization");
      }

      const blob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(blob);
      setImageUrl(imageObjectUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-500">
        Connect to Database and Ask Questions
      </h1>

      {/* Database Connection Form */}
      {!connected && (
        <form onSubmit={handleConnectDb} className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold">Connect to Database</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-lg">Database Type</label>
              <select
                className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none"
                value={dbCredentials.dbType}
                onChange={(e) =>
                  setDbCredentials({ ...dbCredentials, dbType: e.target.value })
                }
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>

            <div>
              <label className="block text-lg">User</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-blue-500 rounded-md text-lg"
                value={dbCredentials.user}
                onChange={(e) =>
                  setDbCredentials({ ...dbCredentials, user: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-lg">Password</label>
              <input
                type="password"
                className="w-full p-3 border-2 border-blue-500 rounded-md text-lg"
                value={dbCredentials.password}
                onChange={(e) =>
                  setDbCredentials({
                    ...dbCredentials,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-lg">Host</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-blue-500 rounded-md text-lg"
                value={dbCredentials.host}
                onChange={(e) =>
                  setDbCredentials({ ...dbCredentials, host: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-lg">Database Name</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-blue-500 rounded-md text-lg"
                value={dbCredentials.database}
                onChange={(e) =>
                  setDbCredentials({
                    ...dbCredentials,
                    database: e.target.value,
                  })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 text-lg font-bold text-white bg-blue-500 rounded-md focus:outline-none hover:bg-blue-600"
            >
              Connect to Database
            </button>
          </div>

          {connectionError && (
            <p className="text-red-500 mt-4">{connectionError}</p>
          )}
        </form>
      )}

      {/* Ask a Question Form */}
      {connected && (
        <>
          <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>

          <form onSubmit={handleSubmitQuestion} className="mb-8 space-y-6">
            <input
              type="text"
              id="question"
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full p-3 border-2 border-blue-500 rounded-md text-lg focus:outline-none"
            />


            <button
              type="submit"
              className={`px-8 py-3 text-lg font-bold text-white rounded-md focus:outline-none transition ${
                loading
                  ? "bg-blue-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Fetching Data..." : "Submit"}
            </button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {imageUrl && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Visualization</h2>
              <img
                src={imageUrl}
                alt="Generated Visualization"
                className="mx-auto"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}