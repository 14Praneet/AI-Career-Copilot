import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResumeUpload: React.FC = () => {
  const { uploadResume, resume, isLoading, error } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (file) {
      await uploadResume(file);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto my-6">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-indigo-400">
        <FileText size={28} />
        Upload Resume
      </h2>
      <p className="text-slate-400 mb-6 text-sm">
        Please upload your resume in PDF format. We will parse the content to prepare it for matching.
      </p>

      {/* Drag and Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          id="resume-file-input"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className="text-slate-500" size={40} />
          {file ? (
            <p className="font-semibold text-indigo-300 flex items-center gap-1">
              <FileText size={18} /> {file.name}
            </p>
          ) : (
            <>
              <p className="font-medium text-slate-300">Drag & Drop your resume here, or click to browse</p>
              <p className="text-xs text-slate-500">Supports PDF files up to 5MB</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {resume && (
        <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-800 rounded-lg flex items-center gap-2 text-emerald-300 text-sm">
          <CheckCircle2 size={18} />
          Successfully parsed: {resume.filename} (ID: {resume.resume_id})
        </div>
      )}

      <button
        onClick={handleUploadSubmit}
        disabled={!file || isLoading}
        className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-all ${
          !file || isLoading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
        }`}
      >
        {isLoading ? 'Processing Resume...' : 'Parse Resume'}
      </button>
    </div>
  );
};
