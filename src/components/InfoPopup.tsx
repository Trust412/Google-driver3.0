import React, { useState, useEffect } from 'react';
import { X, UserX } from 'lucide-react';
import { Contract } from 'ethers';

interface FileData {
  filename: string;
  filesize: number;
  filetype: string;
  cid: string;
  owner: string;
}

interface InfoPopupProps {
  file: {
    file: {
      name: string;
      size: number;
      type: string;
    };
    cid: string;
    owner?: string;
    type: string;
  };
  onClose: () => void;
  contract: Contract;
  currentUser: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ file, onClose, contract, currentUser }) => {
  const [usersWithAccess, setUsersWithAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileDetails, setFileDetails] = useState<FileData | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch file details from contract
        const details = await contract.findFileOwner(file.cid);
        setFileDetails(details);
        await fetchUsersWithAccess();
      } catch (err) {
        console.error('Error initializing file info:', err);
        setError('Failed to fetch file details');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [file.cid, contract]);

  const fetchUsersWithAccess = async () => {
    try {
      const users = await contract.getUsersWithAccess(file.cid);
      const otherUsers = Array.isArray(users) 
        ? users.filter(username => username !== currentUser)
        : [];
      setUsersWithAccess(otherUsers);
    } catch (err) {
      console.error('Error fetching users with access:', err);
      setError('Failed to fetch users with access');
    }
  };

  const handleRevokeAccess = async (username: string) => {
    try {
      setLoading(true);
      const owner = await contract.findFileOwner(file.cid);
    if (!owner) {
      throw new Error('Could not find file owner');
    }
    

      await contract.revokeAccess(file.cid, owner, username);
      // Refresh the users list after revoking access
      await fetchUsersWithAccess();
    } catch (err) {
      console.error('Error revoking access:', err);
      setError('Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | bigint) => {
    // Convert BigInt to string first
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    
    if (numBytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    
    // Ensure we don't exceed array bounds
    const sizeIndex = Math.min(i, sizes.length - 1);
    
    return parseFloat((numBytes / Math.pow(k, sizeIndex)).toFixed(2)) + ' ' + sizes[sizeIndex];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading file information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">File Information</h2>

        {error ? (
          <div className="text-red-400 p-4 rounded bg-red-900/20">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-300">File Details</h3>
              <div className="space-y-2 mt-2">
                <p className="text-gray-400">
                  <span className="font-medium">Name:</span> {file.file.name}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Size:</span> {formatFileSize(file.file.size)}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Type:</span> {file.type}
                </p>
                <p className="text-gray-400 break-all">
                  <span className="font-medium">CID:</span> {file.cid}
                </p>
                {fileDetails?.owner && (
                  <p className="text-gray-400">
                    <span className="font-medium">Owner:</span> {fileDetails.owner}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Users with Access</h3>
              {usersWithAccess.length === 0 ? (
                <p className="text-gray-400">No users have access to this file</p>
              ) : (
                <ul className="space-y-2">
                  {usersWithAccess.map((username, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-700/50 p-2 rounded"
                    >
                      <span className="text-gray-300">{username}</span>
                      <button
                        onClick={() => handleRevokeAccess(username)}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors flex items-center"
                        title="Revoke access"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPopup;
