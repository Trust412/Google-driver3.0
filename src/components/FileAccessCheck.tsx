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

const FileAccessCheck: React.FC<FileAccessCheckProps> = ({ contract, user, cid, username }) => {
  const [fileDetails, setFileDetails] = useState<any>(null); // To store the file details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        
        const owner = await contract.findFileOwner(cid);
        const [password, fileCid, fileType, fileName] = await contract.getFilePassword(cid, owner, user.name);

        setFileDetails({
          password,
          fileCid,
          fileType,
          fileName,
        });
        
      } catch (err) {
        console.error('Error checking file access:', err);
        setError('You do not have permission to access this file.');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [cid, contract, user]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Access Granted!</h2>
      <p>You have permission to view and download this file.</p>
      <button onClick={handleDownload}>Download File</button>
    </div>
  );
};

export default FileAccessCheck;
