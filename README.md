# Google Drive 3.0

Google Drive 3.0 is a decentralized and secure file storage system that leverages IPFS and the Polygon blockchain. Traditional centralized cloud storage solutions can be vulnerable to data breaches, making them unsuitable for confidential files. Google Drive 3.0 addresses these concerns by providing a decentralized alternative with enhanced privacy and security features.

## Project Overview

Google Drive 3.0 allows users to store and manage files in a decentralized way, using the InterPlanetary File System (IPFS) and the Polygon blockchain. Files are encrypted using AES encryption before being uploaded to IPFS through Pinata, ensuring only the owner has access to the decryption password. This protects files from unauthorized access, even if the IPFS data is publicly accessible.

### Key Features

1. **Decentralized Storage**: Files are stored in a distributed network using IPFS, making them resistant to censorship and server failures.
2. **AES Encryption**: Files are encrypted with AES encryption before uploading, ensuring only the owner has access to the decryption key.
3. **Secure Sharing**: Encrypted files can be shared securely with other users, preventing eavesdropping. The file owner can grant or revoke access permissions.
4. **Access Tracking**: File owners can track who has access to their files and manage access permissions.
5. **File Access Control**: Owners can revoke access from users, enhancing control over file distribution.

### Technology Stack

- **IPFS**: Distributed storage for file data.
- **Pinata**: IPFS pinning service for permanent file storage.
- **Polygon Blockchain**: Stores file access permissions and tracking information.
- **AES Encryption**: Provides confidentiality for uploaded files.
- **React & TypeScript**: Frontend framework for building the user interface.
- **Vite**: Build tool for bundling the React application.
- **Ethers.js**: Library for blockchain interaction.

# Project File Structure

Here is an overview of the project's directory structure:

v1 ├── dist # Compiled distribution files ├── node_modules # Installed node modules ├── public # Public assets like images, icons, etc. ├── src # Source code │ ├── components # Reusable components for the UI │ │ ├── AuthWrapper.tsx # Handles user authentication and permissions │ │ ├── FileAccessCheck.tsx # Checks and validates file access permissions │ │ ├── Home.tsx # Home page component │ │ ├── PrivateRoute.tsx # Route protection for authenticated users │ │ ├── SharePopup.tsx # Popup for sharing files securely │ │ ├── Store.tsx # Manages decentralized storage operations │ │ └── Track.tsx # Tracks file access and permissions │ ├── App.tsx # Main application file │ ├── driveABI.json # ABI file for interacting with the smart contract │ ├── ipfs.ts # IPFS integration and functions │ ├── main.tsx # Application entry point │ ├── vite-env.d.ts # Environment variables for Vite │ ├── index.css # Global styling │ ├── index.html # HTML template │ └── .env # Environment variables ├── .gitignore # Git ignore file ├── eslint.config.js # ESLint configuration file ├── index.html # Main HTML template └── package-lock.json # Lock file for package dependencies
