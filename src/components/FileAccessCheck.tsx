import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js'; // Assuming you're using CryptoJS for decryption

interface FileAccessCheckProps {
  contract: any; // The contract instance
  user: any; // The current user (from Auth0 or another auth system)
  cid: string;
  username: string;
}

// const FileAccessCheck: React.FC<FileAccessCheckProps> = ({ contract, user, cid:propCid, username:propUsername }) => {
//   const [fileDetails, setFileDetails] = useState<any>(null); // To store the file details
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [inputCid, setInputCid] = useState('');
//   const [inputUsername, setInputUsername] = useState('');
//   const [hasAccess, setHasAccess] = useState(false);

//     const checkAccess = async (cidToCheck: string, usernameToCheck: string) => {
//       if (!cidToCheck || !usernameToCheck) {
//         setError('Please fill in all fields');
//         return;
//       }

//       try {
//         setLoading(true);
//         setError('');

//         const owner = await contract.findFileOwner(cidToCheck);
//         const [password, fileCid, fileType, fileName] = await contract.getFilePassword(cidToCheck, owner, user.name);

//         setFileDetails({
//           password,
//           fileCid,
//           fileType,
//           fileName,
//         });
//         setHasAccess(true);
        
//       } catch (err) {
//         console.error('Error checking file access:', err);
//         setError('You do not have permission to access this file.');
//         setHasAccess(false);
//       } finally {
//         setLoading(false);
//       }
//     };


//   const decryptFile = (encryptedData: string, password: string, mimeType: string): Blob => {
//     const decryptedData = CryptoJS.AES.decrypt(encryptedData, password);
//     const decryptedBytes = decryptedData.toString(CryptoJS.enc.Base64);

//     const byteCharacters = atob(decryptedBytes);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const uint8Array = new Uint8Array(byteNumbers);
//     return new Blob([uint8Array], { type: mimeType });
//   };

//   const handleDownload = async () => {
//     if (!fileDetails) return;

//     const { fileCid, fileType, fileName, password } = fileDetails;
//     const url = `https://gateway.pinata.cloud/ipfs/${fileCid}`;

//     try {
      
//       const response = await axios.get(url, { responseType: 'text' });
//       const encryptedData = response.data;
      
    
//       const decryptedBlob = decryptFile(encryptedData, password, fileType);

//       const downloadUrl = window.URL.createObjectURL(decryptedBlob);
//       const a = document.createElement('a');
//       a.href = downloadUrl;
//       a.download = fileName;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(downloadUrl); // Clean up
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       setError('Error downloading file.');
//     }
//   };

//   if (!hasAccess) {
//     return (
//       <div className="min-h-[400px] flex items-center justify-center">
//         <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Check File Access</h2>
          
//           <div className="space-y-4">
//             <div>
//               <label htmlFor="cid" className="block text-sm font-medium text-gray-700 mb-1">
//                 File CID
//               </label>
//               <input
//                 type="text"
//                 id="cid"
//                 value={inputCid}
//                 onChange={(e) => setInputCid(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
//                 placeholder="Enter file CID"
//               />
//             </div>

//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 value={inputUsername}
//                 onChange={(e) => setInputUsername(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
//                 placeholder="Enter username"
//               />
//             </div>

//             {error && (
//               <p className="text-red-600 text-sm mt-2">
//                 {error}
//               </p>
//             )}

//             <button
//               onClick={() => checkAccess(inputCid, inputUsername)}
//               disabled={loading}
//               className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
//                   Checking...
//                 </span>
//               ) : (
//                 'Check Access'
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-[400px] flex items-center justify-center">
//         <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
//           <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//           </svg>
//           <p className="text-red-700 font-medium">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[400px] flex items-center justify-center">
//       <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
//         <div className="mb-6">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Granted!</h2>
//           <p className="text-gray-600 mb-6">
//             You have permission to view and download this file.
//             {fileDetails?.fileName && (
//               <span className="block mt-2 text-sm font-medium">
//                 File: {fileDetails.fileName}
//               </span>
//             )}
//           </p>
//         </div>
        
//         <button
//           onClick={handleDownload}
//           className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
//        >
//           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//           </svg>
//           Download File
//         </button>
//       </div>
//     </div>
//   );
// };




const FileAccessCheck: React.FC<FileAccessCheckProps> = ({ contract, user }) => {
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputCid, setInputCid] = useState('');
  const [hasAccess, setHasAccess] = useState(false);

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

  // ... rest of the functions (decryptFile, handleDownload) remain the same ...

  
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

  // Show input form if no access and no URL parameters or if URL check failed
  if (!hasAccess) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Check File Access</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cid" className="block text-sm font-medium text-gray-700 mb-1">
                File CID
              </label>
              <input
                type="text"
                id="cid"
                value={inputCid}
                onChange={(e) => setInputCid(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
                placeholder="Enter file CID"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-2">
                {error}
              </p>
            )}

            <button
              onClick={() => checkAccess(inputCid)}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
  }

  // Show success view with download button
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Granted!</h2>
          <p className="text-gray-600 mb-6">
            You have permission to view and download this file.
            {fileDetails?.fileName && (
              <span className="block mt-2 text-sm font-medium">
                File: {fileDetails.fileName}
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File
          </button>
          
          <button
            onClick={() => {
              setHasAccess(false);
              setInputCid('');
              setError('');
            }}
            className="block w-full text-gray-600 hover:text-gray-900 text-sm font-medium mt-4"
          >
            Check Another File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileAccessCheck;