import React from 'react';
import { X } from 'lucide-react';

interface PreviewPopupProps {
  file: {
    blob: Blob;
    name: string;
    type: string;
  };
  onClose: () => void;
}

const PreviewPopup: React.FC<PreviewPopupProps> = ({ file, onClose }) => {
  const { blob, name, type } = file;
  const isImage = type.startsWith('image/');
  const isPDF = type === 'application/pdf';
  const isText = type.startsWith('text/');
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-4 w-[90%] h-[90%] relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-900 rounded-lg">
          {isImage && (
            <img
              src={URL.createObjectURL(blob)}
              alt={name}
              className="max-w-full max-h-full object-contain mx-auto"
            />
          )}
          {isPDF && (
            <iframe
              src={URL.createObjectURL(blob)}
              className="w-full h-full"
              title={name}
            />
          )}
          {isText && (
            <iframe
              src={URL.createObjectURL(blob)}
              className="w-full h-full"
              title={name}
            />
          )}
          {isVideo && (
            <video controls className="w-full h-full">
              <source src={URL.createObjectURL(blob)} type={type} />
              Your browser does not support the video tag.
            </video>
          )}
          {isAudio && (
            <div className="flex items-center justify-center h-full">
              <audio controls>
                <source src={URL.createObjectURL(blob)} type={type} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
          {!isImage && !isPDF && !isText && !isVideo && !isAudio && (
            <div className="flex items-center justify-center h-full text-gray-400">
              Preview not available for this file type
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPopup;
