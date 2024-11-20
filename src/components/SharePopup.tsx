import React, { useState, useEffect, useRef } from 'react';

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
  const [shareableLink, setShareableLink] = useState(''); // New state for the link
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {

    // Focus on input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleClose = () => {
    onClose();
    // Focus on search input after closing
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder="Search files..."]');
      (searchInput as HTMLInputElement)?.focus();
    }, 0);
  };

  const grantAccess = async () => {
    console.log("granting access");
    if (!userExists) return;

    setLoading(true);
    try {
      const owner = await contract.findFileOwner(cid); // Fetch the file owner
      await contract.grantAccess(cid, owner, username);
      const shareableLink = `${window.location.origin}?tab=fileaccess&cid=${cid}&username=${username}`;
      setShareableLink(shareableLink);

    } catch (err) {
      console.error('Error granting access:', err);
      setError('Error granting access.');
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    // Optional: Add some visual feedback that the link was copied
    setError('Link copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  useEffect(() => {
    const checkUserExists = async () => {
      if (username === '') {
        setUserExists(false);
        setError('');
        return;
      }

      setLoading(true); // Start loading when checking for user
      try {
        const users = await contract.getUserList();
        setUserExists(users.includes(username));
        setError('');
      } catch (err) {
        console.error('Error checking user existence:', err);
        setError('Error checking user existence.');
        setUserExists(false); // Reset if error occurs
      } finally {
        setLoading(false); // Stop loading after check
      }
    };

    checkUserExists();
  }, [username, contract]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Share File</h2>

        {!shareableLink ? (
          // Show username input and grant access button if no link generated yet
          <>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="border text-black border-gray-300 p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {loading ? (
              <p className="text-blue-500 text-center mt-2">Checking user...</p>
            ) : (
              <>
                {userExists && (
                  <div className="text-center mt-4">
                    <button
                      onClick={grantAccess}
                      className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 transition duration-300"
                      disabled={loading}
                    >
                      Grant Access
                    </button>
                  </div>
                )}
                {!userExists && username && !loading && (
                  <p className="text-red-500 text-center mt-2">User does not exist.</p>
                )}
              </>
            )}
          </>
        ) : (
          // Show the shareable link and copy button after access is granted
          <div className="mt-4">
            <p className="text-white mb-2">Share this link with {username}:</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="border text-black border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition duration-300"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {error && <p className={`text-center mt-2 ${error.includes('copied') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
        <button
          onClick={handleClose}
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline w-full text-center"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SharePopup;
