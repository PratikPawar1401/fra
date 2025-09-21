import React, { useState } from 'react';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadType, setUploadType] = useState('documents');

  const uploadTypes = [
    { id: 'documents', name: 'Documents & Reports', description: 'PDFs, Word documents, spreadsheets' },
    { id: 'spatial', name: 'Spatial Data', description: 'Shapefiles, GeoJSON, KML files' },
    { id: 'images', name: 'Images & Maps', description: 'Photographs, satellite imagery, maps' },
    { id: 'forms', name: 'Claim Forms', description: 'Forest rights claim applications' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      status: 'ready',
      progress: 0,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const simulateUpload = (fileId) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      )
    );

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const file = prev.find(f => f.id === fileId);
        if (!file || file.progress >= 100) {
          clearInterval(interval);
          if (file && file.progress >= 100) {
            return prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'completed' }
                : f
            );
          }
          return prev;
        }
        
        return prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 30, 100) }
            : f
        );
      });
    }, 500);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
        <p className="text-gray-600">
          Upload documents, spatial data, images, and other files to the FRA WebGIS system.
        </p>
      </div>

      {/* Upload Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Upload Type</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {uploadTypes.map(type => (
            <label key={type.id} className="cursor-pointer">
              <input
                type="radio"
                name="uploadType"
                value={type.id}
                checked={uploadType === type.id}
                onChange={(e) => setUploadType(e.target.value)}
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg transition-colors ${
                uploadType === type.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <h3 className="font-semibold text-gray-800">{type.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-gray-600 mb-4">
            Supports: PDF, DOC, DOCX, XLS, XLSX, SHP, GeoJSON, KML, JPG, PNG
          </p>
          <input
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
            id="fileInput"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.shp,.geojson,.kml,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="fileInput"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
          >
            Select Files
          </label>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Files to Upload ({uploadedFiles.length})
            </h2>
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              onClick={() => {
                uploadedFiles
                  .filter(file => file.status === 'ready')
                  .forEach(file => simulateUpload(file.id));
              }}
            >
              Upload All
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{file.name}</span>
                    <span className="text-sm text-gray-500">{file.size}</span>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {file.status === 'completed' && (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                      Upload completed
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {file.status === 'ready' && (
                    <button
                      onClick={() => simulateUpload(file.id)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      Upload
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;