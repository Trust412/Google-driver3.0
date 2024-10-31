import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Upload, File, Trash2 } from 'lucide-react';
import { Wallet, Contract,JsonRpcProvider  } from 'ethers';
import driveABI from './driveABI.json'; // Adjust the path if needed


const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
interface UploadedFile {
  file: File;
  cid: string; // Store the IPFS CID
  type: string; // Store the original MIME type
}
interface StoreProps {
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}
const Store: React.FC<StoreProps> = ({ user }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const username = user?.name;
  const password = username || ''; // Use a strong password for encryption
  console.log("Username:",username);
  const rpcUrl = import.meta.env.VITE_POLYGON_RPC_URL;
  const privateKey = import.meta.env.VITE_PRIVATE_KEY;


  const provider = new JsonRpcProvider(rpcUrl); // Replace with your RPC URL
  const signer = new Wallet(privateKey, provider); // Replace with your private key

  if (!contractAddress) {
    throw new Error('Environment variable CONTRACT_ADDRESS must be defined');
  }
  const contract = new Contract(contractAddress, driveABI, signer);


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
    // Upload each file to Pinata
    droppedFiles.forEach(file => uploadFileToPinata(file));
  }, []);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Upload each selected file to Pinata
      selectedFiles.forEach(file => uploadFileToPinata(file));
    }
  }, []);

  const encryptFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Ensure that event.target.result is not null
        if (event.target?.result) {
          const binaryData = event.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(binaryData));
          const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
          resolve(encrypted);
        } else {
          reject(new Error('File reading failed, result is null.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file); // Read file as an array buffer
    });
  };

  const decryptFile = (encryptedData: string, mimeType: string): Blob => {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedBytes = decryptedData.toString(CryptoJS.enc.Base64);
    
    // Convert Base64 string to Uint8Array
    const byteCharacters = atob(decryptedBytes);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const uint8Array = new Uint8Array(byteNumbers);
    return new Blob([uint8Array], { type: mimeType }); // Adjust MIME type as necessary
  };

  const unpinFileFromPinata = async (cid: string) => {
    const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;
    const options = {
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
      },
    };

    try {
      await axios.delete(url, options);
      console.log(`File unpinned from Pinata: ${cid}`);
    } catch (error) {
      console.error('Error unpinning file from Pinata:', error);
    }
  };

  const removeFile = useCallback(async (index: number) => {
    if (index < 0 || index >= files.length) {
      console.error('Index out of bounds:', index);
      return; // Exit if index is invalid
    }
    const uploadedFile = files[index];
    try {
      await unpinFileFromPinata(uploadedFile.cid);
      await contract.deleteFile(username, uploadedFile.file.name);
      // Update state to remove the file from the list
      setFiles(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing file:', error);
    }
  }, [files]);

  const uploadFileToPinata = async (file: File) => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    
    // Encrypt the file before uploading
    const encryptedFile = await encryptFile(file);
    // const blob = new Blob([encryptedFile], { type: 'application/octet-stream' }); // Adjust MIME type as necessary
    formData.append('file', new Blob([encryptedFile]), file.name); // Use original file name for better identification

    const options = {
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
      },
    };

    try {
      const response = await axios.post(url, formData, options);
      const cid = response.data.IpfsHash; // Get the IPFS CID from the response
      console.log('File uploaded to Pinata:', response.data);
      
      await contract.uploadFile(username, file.name, file.type, file.size, cid);

      // Update state with new file and its CID
      setFiles(prev => [...prev, { file, cid, type: file.type }]);
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
    }
  };

  const handleDownload = async (cid: string,mimeType: string) => {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    try {
      const response = await axios.get(url, { responseType: 'text' });
      const encryptedData = response.data;
      const decryptedBlob = decryptFile(encryptedData,mimeType);
      
      // Create a download link for the decrypted file
      const downloadUrl = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'decrypted_file'; // You can set a dynamic file name here
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl); // Clean up
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFiles = useCallback(async () => {
    try {
        const userFiles = await contract.getFiles(username); // Replace 'username' with actual username
        const uploadedFiles = await Promise.all(userFiles.map(async (file: any) => ({
            file: { name: file.filename, size: file.filesize, type: file.filetype },
            cid: file.cid,
            type: file.filetype
        })));
        setFiles(uploadedFiles);
    } catch (error) {
        console.error('Error retrieving files:', error);
    }
}, []);

useEffect(() => {
    getFiles(); // Fetch files when component mounts
}, [getFiles]);

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
              {files.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-6 h-6 text-blue-400" />
                    <div>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${uploadedFile.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-300 hover:underline"
                      >
                        {uploadedFile.file.name}
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(uploadedFile.cid,uploadedFile.type)}
                      className="p-2 hover:bg-blue-500/20 rounded-full transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
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
