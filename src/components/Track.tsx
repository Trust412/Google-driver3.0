import React from 'react';
import { Search } from 'lucide-react';

function Track() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <Search className="w-24 h-24 mx-auto text-gray-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Track Files</h1>
        <p className="text-gray-400">
          File tracking functionality coming soon...
        </p>
      </div>
    </div>
  );
}

export default Track;