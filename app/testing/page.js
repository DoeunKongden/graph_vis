"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make the request to the FastAPI backend
      const response = await fetch(
        `http://localhost:8000/code-to-visualization?question=${encodeURIComponent(question)}`,
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Python Script Execute To Visualization</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            id="question"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button
          type="submit"
          style={loading ? styles.buttonLoading : styles.button}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Visualization"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {imageUrl && (
        <div style={styles.imageContainer}>
          <h2 style={styles.imageTitle}>Your Visualization</h2>
          <img
            src={imageUrl}
            alt="Generated visualization"
            style={styles.image}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    color: "#2c3e50",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    color: "#3498db",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#7f8c8d",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "2px solid #3498db",
    borderRadius: "5px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#3498db",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonLoading: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#2980b9",
    border: "none",
    borderRadius: "5px",
    cursor: "not-allowed",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
  imageContainer: {
    marginTop: "2rem",
  },
  imageTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  image: {
    maxWidth: "100%",
    height: "auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
};

// Add hover effect to the button
styles.button["&:hover"] = {
  backgroundColor: "#2980b9",
};
