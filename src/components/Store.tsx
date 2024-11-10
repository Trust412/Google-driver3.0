import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Search, Upload, File, Trash2, Loader2, MoreVertical,Download, Share, Lock, Info, Eye } from 'lucide-react';
import { Contract  } from 'ethers';
import SharePopup from './SharePopup';
import InfoPopup from './InfoPopup';
import PreviewPopup from './PreviewPopup';


interface UploadedFile {
  file: File;
  cid: string; 
  type: string; 
  password: string;
}
interface StoreProps {
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  contract: Contract;
}
const Store: React.FC<StoreProps> = ({ user,contract }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading status
  const username = user?.name;
  const [menuOpen, setMenuOpen] = useState<number | null>(null); // State to track which menu is open
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]); // Array of refs for each menu item
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null); // Adjust the type as necessary
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());

  
useEffect(() => {
  const filtered = searchQuery.length >= 2 
    ? files.filter(file => file.file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;
  setFilteredFiles(filtered);
}, [files, searchQuery]);



  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuOpen !== null) {
      const currentMenuRef = menuRefs.current[menuOpen];
      if (currentMenuRef && !currentMenuRef.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    }
  }, [menuOpen]);


  useEffect(() => {
    if (menuOpen !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, handleClickOutside]);


  // Menu toggle handler
  const handleMenuClick = (index: number) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

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

  const generateRandomNumber = (): number => {
    return Math.floor(Math.random() * 1000000); // Generate a random number
  };
  
  // Function to create SHA-256 hash using filename and random number
const generatePasswordFromFilename = (filename: string): string => {
  const randomNumber = generateRandomNumber(); // Generate a random number
  const combinedString = `${filename}-${randomNumber}`; // Combine filename and random number
  const hash = CryptoJS.SHA256(combinedString).toString(CryptoJS.enc.Hex);
  return hash; // Use this hash as the password
};

const encryptFile = (file: File, password: string): Promise<string> => {
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


  
  const decryptFile = (encryptedData: string, password: string, mimeType: string): Blob => {
    try {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, password);
      const decryptedBytes = decryptedData.toString(CryptoJS.enc.Base64);
      
      // Convert Base64 string to Uint8Array
      const byteCharacters = atob(decryptedBytes);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const uint8Array = new Uint8Array(byteNumbers);
      return new Blob([uint8Array], { type: mimeType });
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
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
      return;
    }
    
    // Start deletion animation
    setDeletingFiles(prev => new Set(prev).add(index));
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const uploadedFile = files[index];
    try {
      await unpinFileFromPinata(uploadedFile.cid);
      await contract.deleteFile(username, uploadedFile.file.name);
      setFiles(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing file:', error);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  }, [files]);

  const uploadFileToPinata = async (file: File) => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    const randomPassword = generatePasswordFromFilename(file.name); 
    const encryptedFile = await encryptFile(file, randomPassword);
    formData.append('file', new Blob([encryptedFile]), file.name);

    const options = {
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
      },
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      },
    };

    setLoading(true);
    setUploadProgress(0);
    try {
      const response = await axios.post(url, formData, options);
      const cid = response.data.IpfsHash; // Get the IPFS CID from the response
      console.log('File uploaded to Pinata:', response.data);
      
      await contract.uploadFile(username, file.name, file.type, file.size, cid, randomPassword);

      // Update files state directly instead of triggering a refresh
      setFiles(prev => [...prev, { file, cid, type: file.type, password: randomPassword }]);
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (cid: string, mimeType: string, filename: string) => {
    try {
      setDownloadLoading(true); // Start loading
      const owner = await contract.findFileOwner(cid);
      const [password] = await contract.getFilePassword(cid, owner, username);

      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, { 
        responseType: 'text',
        timeout: 10000
      });

      if (!response.data) {
        throw new Error('No data received from IPFS');
      }

      const encryptedData = response.data;
      const decryptedBlob = decryptFile(encryptedData, password, mimeType);
      
      if (!decryptedBlob) {
        throw new Error('Failed to decrypt file');
      }

      const downloadUrl = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloadLoading(false); // End loading
    }
  };

  const getFiles = useCallback(async () => {
    // Add check to prevent duplicate calls
    if (!username) return;
    
    try {
      const userFiles = await contract.getFiles(username);
      const uploadedFiles = await Promise.all(userFiles.map(async (file: any) => ({
        file: { name: file.filename, size: file.filesize, type: file.filetype },
        cid: file.cid,
        type: file.filetype
      })));
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Error retrieving files:', error);
    }
  }, [contract, username]);

  // Replace the existing useEffect with this one
  useEffect(() => {
    if (username && files.length === 0) {
      getFiles();
    }
  }, [username, getFiles]);

  const handleShare = async (file: any) => {
    try {
      setUploadedFile(file);
      setShowSharePopup(true);
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };
  const closeSharePopup = () => {
    setShowSharePopup(false); // Close the share popup
  };


  const handleInfo = (file: any) => {
    setSelectedFile(file);
    setShowInfoPopup(true);
    setMenuOpen(null);
  };

  const closeInfoPopup = () => {
    setShowInfoPopup(false);
    setSelectedFile(null);
  };

  // Update the formatFileSize function to handle BigInt
  const formatFileSize = (bytes: number | BigInt): string => {
    if (bytes === 0 || bytes === BigInt(0)) return '0 Bytes';
    
    // Convert BigInt to number if necessary
    const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    // Handle edge case when bytesNum is 0 to avoid -Infinity from Math.log(0)
    if (bytesNum === 0) return '0 Bytes';
    
    const i = Math.min(Math.floor(Math.log(Math.abs(bytesNum)) / Math.log(k)), sizes.length - 1);
    return parseFloat((bytesNum / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const SearchBar = () => (
    <div className="mb-4 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        // onBlur={(e) => e.target.focus()}
      />
    </div>
  );

  const handlePreview = async (file: any) => {
    try {
      setPreviewLoading(true); // Start loading
      const owner = await contract.findFileOwner(file.cid);
      const [password] = await contract.getFilePassword(file.cid, owner, username);
      
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${file.cid}`, { 
        responseType: 'text',
        timeout: 10000
      });

      if (!response.data) {
        throw new Error('No data received from IPFS');
      }

      const encryptedData = response.data;
      const decryptedBlob = decryptFile(encryptedData, password, file.type);
      
      if (!decryptedBlob) {
        throw new Error('Failed to decrypt file');
      }

      setPreviewFile({ blob: decryptedBlob, name: file.file.name, type: file.type });
      setShowPreviewPopup(true);
    } catch (error) {
      console.error('Error previewing file:', error);
    } finally {
      setPreviewLoading(false); // End loading regardless of success/failure
    }
  };

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
        {/* Loader */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-white animate-spin" />
              <p className="text-white mt-4">Uploading... {uploadProgress}%</p>
              <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {/* File List */}
        {files.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Uploaded Files</h2>
              <p className="text-sm text-gray-400">
                {filteredFiles.length} of {files.length} files
              </p>
            </div>
            
            <SearchBar />

            {filteredFiles.length === 0 && searchQuery !== '' ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No files match your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFiles.map((uploadedFile, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between bg-gray-700/50 p-4 rounded-lg
                      transition-all duration-500 transform
                      ${deletingFiles.has(index) ? 'scale-0 opacity-0 rotate-12' : 'scale-100 opacity-100 rotate-0'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <File className="w-6 h-6 text-blue-400" />
                      <div>
                        <div>
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${uploadedFile.cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-300 hover:text-blue-400 transition-colors hover:underline"
                          >
                            {uploadedFile.file.name}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* File size */}
                      <span className="text-sm text-gray-400">
                        {formatFileSize(uploadedFile.file.size)}
                      </span>
                      
                      {/* Preview button */}
                      <button
                        onClick={() => handlePreview(uploadedFile)}
                        className="p-2 hover:bg-gray-600/20 rounded-full transition-colors group relative"
                        disabled={previewLoading}
                      >
                        {previewLoading ? (
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <Eye className="w-5 h-5 text-gray-400" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-full mt-1 text-xs text-white bg-gray-700 rounded-md px-2 py-1 whitespace-nowrap">
                              Preview File
                            </span>
                          </>
                        )}
                      </button>

                      {/* Menu button with loading state */}
                      <div className="relative">
                        <button
                          onClick={() => handleMenuClick(index)}
                          className="p-2 hover:bg-gray-600/20 rounded-full transition-colors"
                          disabled={downloadLoading}
                        >
                          {downloadLoading ? (
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                          ) : (
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {menuOpen === index && !downloadLoading && (
                          <div 
                            ref={(el) => (menuRefs.current[index] = el)} 
                            className="absolute right-0 bottom-full mb-1 w-28 bg-gray-800 rounded-md shadow-lg z-10"
                          >
                            <button
                              onClick={() => {
                                handleDownload(uploadedFile.cid, uploadedFile.type, uploadedFile.file.name);
                                setMenuOpen(null);
                              }}
                              className="block w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center group"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              <span>Download</span>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 text-xs text-white bg-gray-700 rounded-md px-2 py-1">
                                Download
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                handleShare(uploadedFile);
                                setMenuOpen(null);
                              }}
                              className="block w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center group"
                            >
                              <Share className="w-4 h-4 mr-2" />Share
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 text-xs text-white bg-gray-700 rounded-md px-2 py-1">
                                Share
                              </span>
                            </button>
                            
                            {/* <button
                             onClick={() => {
                              handleShareConfidential(uploadedFile);
                              setMenuOpen(null);
                            }}
                              className="block w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center group"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 text-xs text-white bg-gray-700 rounded-md px-2 py-1">
                                Share as Confidential
                              </span>
                            </button> */}
                            <button
                              onClick={() => handleInfo(uploadedFile)}
                              className="block w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center group"
                            >
                              <Info className="w-4 h-4 mr-2" /> Info
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 text-xs text-white bg-gray-700 rounded-md px-2 py-1">
                                File Info
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                removeFile(index);
                                setMenuOpen(null);
                              }}
                              className="block w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center group"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Unpin
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 text-xs text-white bg-gray-700 rounded-md px-2 py-1">
                                Delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  

                ))}
                
              </div>
            )}
          </div>
        )}
      </div>
      {showInfoPopup && selectedFile && (
        <InfoPopup
          file={selectedFile}
          contract={contract}
          onClose={closeInfoPopup}
          currentUser={user?.name || ''}
        />
      )}
      {showPreviewPopup && previewFile && (
        <PreviewPopup
          file={previewFile}
          onClose={() => {
            setShowPreviewPopup(false);
            setPreviewFile(null);
          }}
        />
      )}
      {showSharePopup && uploadedFile && (
        <SharePopup
          cid={uploadedFile.cid}
          onClose={closeSharePopup}
          contract={contract}
        />
      )}
    </div>
  );
}

export default Store;
