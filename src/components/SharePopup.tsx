import React, { useState } from 'react';

interface SharePopupProps {
  cid: string;
  onClose: () => void;
  contract: any; // Pass the contract instance
}

const SharePopup: React.FC<SharePopupProps> = ({ cid, onClose, contract }) => {
  const [username, setUsername] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUserExists = async () => {
    try {
      const users = await contract.getUserList();
      setUserExists(users.includes(username));
      setError('');
    } catch (err) {
      console.error('Error checking user existence:', err);
      setError('Error checking user existence.');
    }
  };

  const grantAccess = async () => {
    if (!userExists) return;

    setLoading(true);
    try {
      const owner = await contract.findFileOwner(cid); // Fetch the file owner
      await contract.grantAccess(cid, owner, username);
      alert(`Access granted to ${username}`);
      onClose(); // Close the modal after granting access
    } catch (err) {
      console.error('Error granting access:', err);
      setError('Error granting access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Share File</h2>

        {/* Username Input */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="border text-black border-gray-300 p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Check User Button */}
        <button
          onClick={checkUserExists}
          className="bg-blue-600 text-white w-full py-2 rounded mb-4 hover:bg-blue-700 transition duration-300"
        >
          {loading ? 'Checking...' : 'Check User'}
        </button>

        {/* User Exists or Error Display */}
        {userExists && (
          <div className="text-center mt-4">
            <button
              onClick={grantAccess}
              className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Granting Access...' : 'Grant Access'}
            </button>
          </div>
        )}

        {!userExists && username && <p className="text-red-500 text-center mt-2">User does not exist.</p>}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline w-full text-center"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SharePopup;
