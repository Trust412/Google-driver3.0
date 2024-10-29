import React, { useState, useCallback } from 'react';
import { Upload, File, Trash2 } from 'lucide-react';

function Store() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Store Files</h1>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl mb-2">Drag and drop files here</p>
          <p className="text-gray-400 mb-4">or</p>
          <label className="inline-block">
            <input
              type="file"
              className="hidden"
              multiple
              onChange={onFileSelect}
            />
            <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
              Browse Files
            </span>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Store;