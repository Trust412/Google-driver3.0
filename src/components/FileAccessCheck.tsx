import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js'; // Assuming you're using CryptoJS for decryption
import PreviewPopup from './PreviewPopup';
interface FileAccessCheckProps {
  contract: any; // The contract instance
  user: any; // The current user (from Auth0 or another auth system)
  cid: string;
  username: string;
}

const FileAccessCheck: React.FC<FileAccessCheckProps> = ({ contract, user }) => {
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputCid, setInputCid] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [fileOwners, setFileOwners] = useState<{ [key: string]: string }>({});
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [viewedFiles, setViewedFiles] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('viewedFiles') || '[]'))
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Get URL parameters
  const { cid: urlCid} = useParams();

  useEffect(() => {
    // If URL parameters exist, try to check access automatically
    if (urlCid && contract && user) {
      checkAccess(urlCid);
    }
  }, [urlCid, contract, user]);

  const checkAccess = async (cidToCheck: string) => {
    if (!cidToCheck) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const owner = await contract.findFileOwner(cidToCheck);
      const [password, fileCid, fileType, fileName] = await contract.getFilePassword(cidToCheck, owner, user.name);

      setFileDetails({
        password,
        fileCid,
        fileType,
        fileName,
      });
      setHasAccess(true);
      
    } catch (err) {
      console.error('Error checking file access:', err);
      setError('You do not have permission to access this file.');
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && user?.name) {
      fetchSharedFiles();
    }
  }, [contract, user]);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const files = await contract.getSharedFilesWithAccess(user.name);
      setSharedFiles(files);
    } catch (err) {
      console.error('Error fetching shared files:', err);
      setError('Failed to fetch shared files');
    } finally {
      setLoading(false);
    }
  };

  
  const decryptFile = (encryptedData: string, password: string, mimeType: string): Blob => {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedBytes = decryptedData.toString(CryptoJS.enc.Base64);

    const byteCharacters = atob(decryptedBytes);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const uint8Array = new Uint8Array(byteNumbers);
    return new Blob([uint8Array], { type: mimeType });
  };

  const handleDownload = async () => {
    if (!fileDetails) return;

    const { fileCid, fileType, fileName, password } = fileDetails;
    const url = `https://gateway.pinata.cloud/ipfs/${fileCid}`;

    try {
      
      const response = await axios.get(url, { responseType: 'text' });
      const encryptedData = response.data;
      
    
      const decryptedBlob = decryptFile(encryptedData, password, fileType);

      const downloadUrl = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl); // Clean up
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Error downloading file.');
    }
  };

  const handleSharedFileView = async (file: any) => {
    try {
      // Clear existing states
      setShowPreviewPopup(false);
      setPreviewFile(null);
      
      // Get file details and password
      const owner = await contract.findFileOwner(file[3]); // Use direct index for CID
      const [password] = await contract.getFilePassword(file[3], owner, user.name);
      
      // Fetch and decrypt file
      const url = `https://gateway.pinata.cloud/ipfs/${file[3]}`; // Use CID directly
      const response = await axios.get(url, { responseType: 'text' });
      
      const decryptedBlob = decryptFile(response.data, password, file[1]); // Use direct index for type
      
      // Set states for PreviewPopup
      setPreviewFile({
        blob: decryptedBlob,
        name: file[0], // filename is at index 0
        type: file[1]  // type is at index 1
      });
      setShowPreviewPopup(true);
      
      // Mark file as viewed after successful view
      markFileAsViewed(file[3]); // Using CID as unique identifier
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error viewing shared file:', error);
      setError(`Error viewing file: ${errorMessage}`);
      setPreviewFile(null);
      setShowPreviewPopup(false);
    }
  };

  const handleSharedFileDownload = async (file: any) => {
    try {
      const owner = await contract.findFileOwner(file.cid);
      const [password, fileCid, fileType, fileName] = await contract.getFilePassword(file.cid, owner, user.name);
      
      const url = `https://gateway.pinata.cloud/ipfs/${fileCid}`;
      const response = await axios.get(url, { responseType: 'text' });
      const encryptedData = response.data;
      
      const decryptedBlob = decryptFile(encryptedData, password, fileType);
      
      const downloadUrl = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading shared file:', error);
      setError('Error downloading file.');
    }
  };

  useEffect(() => {
    if (contract && user?.name) {
      fetchFileOwners(); // Replace fetchSharedFiles() with fetchFileOwners()
    }
  }, [contract, user]);
  
  const fetchFileOwners = async () => {
    try {
      setLoading(true);
      const files = await contract.getSharedFilesWithAccess(user.name);
      setSharedFiles(files);
  
      // Process files in batches of 3
      const ownersMap: { [key: string]: string } = {};
      const batchSize = 3;
      
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchOwners = await Promise.all(
          batch.map((file: { cid: string }) => contract.findFileOwner(file.cid))
        );
        
        batch.forEach((file: { cid: string }, index: number) => {
          ownersMap[file.cid] = batchOwners[index];
        });
      }
      
      setFileOwners(ownersMap);
    } catch (err) {
      console.error('Error fetching shared files:', err);
      setError('Failed to fetch shared files');
    } finally {
      setLoading(false);
    }
  };

  // Add this new function near your other handlers
  const handleFileView = async () => {
    if (!fileDetails) return;
    try {
      const { fileCid, fileType, fileName, password } = fileDetails;
      const url = `https://gateway.pinata.cloud/ipfs/${fileCid}`;
      
      const response = await axios.get(url, { responseType: 'text' });
      const encryptedData = response.data;
      
      const decryptedBlob = decryptFile(encryptedData, password, fileType);
      
      setPreviewFile({
        blob: decryptedBlob,
        name: fileName,
        type: fileType
      });
      setShowPreviewPopup(true);
    } catch (error) {
      console.error('Error viewing file:', error);
      setError('Error viewing file.');
    }
  };

  // Add this function to mark a file as viewed
  const markFileAsViewed = (fileCid: string) => {
    setViewedFiles(prev => {
      const newSet = new Set(prev).add(fileCid);
      localStorage.setItem('viewedFiles', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Show loading state while checking URL parameters
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
          
          {/* Added "Try Again" section */}
          <div className="mt-6">
            <p className="text-gray-600 mb-4">Want to try a different file?</p>
            <button
              onClick={() => {
                setError('');
                setHasAccess(false);
                setInputCid('');
              }}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Check Another File
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredSharedFiles = searchQuery.length >= 2
    ? sharedFiles.filter(file => file[0].toLowerCase().includes(searchQuery.toLowerCase()))
    : sharedFiles;

  // Add sorting to prioritize unviewed files
  const sortedFilteredFiles = [...filteredSharedFiles].sort((a, b) => {
    const isAViewed = viewedFiles.has(a[3]);
    const isBViewed = viewedFiles.has(b[3]);
    if (isAViewed === isBViewed) return 0;
    return isAViewed ? 1 : -1;
  });

  const SharedFilesList = () => (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Files Shared With You</h3>
        
        {/* Search input */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filteredSharedFiles.length === 0 ? (
        <p className="text-gray-400">
          {searchQuery.length >= 2 ? 'No matching files found.' : 'No files have been shared with you yet.'}
        </p>
      ) : (
        <div className="grid gap-4">
          {sortedFilteredFiles.map((file, index) => {
            const isViewed = viewedFiles.has(file[3]);
            return (
              <div 
                key={index} 
                className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4
                  ${isViewed ? 'bg-gray-800 border-gray-700' : 'bg-blue-900 border-blue-700 border'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white mb-1 truncate">
                      {file[0]}
                    </h4>
                    {!isViewed && (
                      <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900 rounded-full border border-blue-700">
                        New
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Owner:</span> {fileOwners[file.cid] || 'Loading...'}
                    </p>
                    <p className="text-sm text-gray-400 font-mono truncate">
                      <span className="font-sans font-medium">CID:</span> {file.cid}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSharedFileDownload(file)}
                  className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => handleSharedFileView(file)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

if (!hasAccess) {
  return (
    <div className="min-h-[400px] space-y-8 bg-gray-900 p-8">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Check File Access</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cid" className="block text-sm font-medium text-gray-300 mb-1">
                File CID
              </label>
              <input
                type="text"
                id="cid"
                value={inputCid}
                onChange={(e) => setInputCid(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-white"
                placeholder="Enter file CID"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-2">
                {error}
              </p>
            )}

            <button
              onClick={() => checkAccess(inputCid)}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Checking...
                </span>
              ) : (
                'Check Access'
              )}
            </button>
          </div>
        </div>
      </div>
      <SharedFilesList />
      {showPreviewPopup && previewFile && (
        <PreviewPopup
          file={previewFile}
          onClose={() => {
            setShowPreviewPopup(false);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}

// Show success view with download button
return (
  <div className="min-h-[400px] space-y-8 bg-gray-900 p-8">
    <div className="flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Granted!</h2>
          <p className="text-gray-300 mb-6">
            You have permission to view and download this file.
            {fileDetails?.fileName && (
              <span className="block mt-2 text-sm font-medium">
                File: {fileDetails.fileName}
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
            
            <button
              onClick={handleFileView}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View File
            </button>
          </div>
          
          <button
            onClick={() => {
              setHasAccess(false);
              setInputCid('');
              setError('');
            }}
            className="block w-full text-gray-400 hover:text-white text-sm font-medium mt-4"
          >
            Check Another File
          </button>
        </div>
      </div>
    </div>
    <SharedFilesList />
    {showPreviewPopup && previewFile && (
      <PreviewPopup
        file={previewFile}
        onClose={() => {
          setShowPreviewPopup(false);
          setPreviewFile(null);
        }}
      />
    )}
  </div>
);
}
export default FileAccessCheck;