// src/components/DetectionResult.jsx
import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "./DetectionResult.css";

export function DetectionResult({ detection }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (
      imageLoaded &&
      canvasRef.current &&
      imageRef.current &&
      detection.details
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      // Match canvas internal resolution to the image's actual size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding boxes based on backend coordinates
      detection.details.forEach((item) => {
        const x = item.bbox_x;
        const y = item.bbox_y;
        const width = item.bbox_w;
        const height = item.bbox_h;

        // Draw Box
        ctx.strokeStyle = "#ef4444"; // Red border
        ctx.lineWidth = Math.max(3, canvas.width * 0.005);
        ctx.strokeRect(x, y, width, height);

        // Draw Label Background
        const label = `${item.class_name} ${Math.round(item.confidence * 100)}%`;
        ctx.font = `${Math.max(16, canvas.width * 0.02)}px sans-serif`;
        const textMetrics = ctx.measureText(label);
        const padding = 8;

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
          x,
          y - (textMetrics.actualBoundingBoxAscent + padding * 2),
          textMetrics.width + padding * 2,
          textMetrics.actualBoundingBoxAscent + padding * 2,
        );

        // Draw Text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + padding, y - padding);
      });
    }
  }, [imageLoaded, detection]);

  return (
    <div className="result-card">
      <h3 className="result-header">Analysis Result</h3>

      <div className="image-wrapper">
        <img
          ref={imageRef}
          src={detection.image_url}
          alt="Campus Upload"
          onLoad={() => setImageLoaded(true)}
          crossOrigin="anonymous" // Important for CORS with canvas
        />
        <canvas ref={canvasRef} />
      </div>

      <div
        className={`status-badge ${detection.status === "clean" ? "status-clean" : "status-violation"}`}
      >
        {detection.status === "clean" ? (
          <>
            <CheckCircle2 size={18} /> Civic Sense Maintained
          </>
        ) : (
          <>
            <AlertCircle size={18} /> Civic Sense Violated
          </>
        )}
      </div>

      <div className="detected-items">
        <h4>Detected Items</h4>
        {detection.details && detection.details.length > 0 ? (
          detection.details.map((item, index) => (
            <div key={index} className="item-row">
              <span className="item-name">{item.class_name}</span>
              <span className="item-conf">
                {Math.round(item.confidence * 100)}% Confidence
              </span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
            No items detected. Area is clean!
          </p>
        )}
      </div>
    </div>
  );
}
