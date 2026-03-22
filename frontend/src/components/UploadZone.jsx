// src/components/UploadZone.jsx
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import "./UploadZone.css";

export function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="upload-zone-card">
      <h3 className="upload-zone-header">Upload Campus Image</h3>

      <div
        className={`drop-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="icon-container">
          <Upload
            size={24}
            color={isDragging ? "var(--emerald-600)" : "var(--gray-400)"}
          />
        </div>

        <div>
          <p className="upload-text">Drag and drop an image here</p>
          <p className="upload-subtext">or click to browse files (PNG, JPG)</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
