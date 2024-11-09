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

### Environment Variables

In the root of your project, create a `.env` file and add the following variables. These are necessary for connecting to the blockchain, interacting with IPFS via Pinata, and accessing your smart contract.

```plaintext
VITE_POLYGON_RPC_URL=          # Your Polygon RPC endpoint (e.g., from Infura or Alchemy)
VITE_PRIVATE_KEY=              # Private key of the wallet used for blockchain transactions
VITE_CONTRACT_ADDRESS=         # Deployed smart contract address
VITE_PINATA_API_KEY=           # Pinata API key for IPFS storage
VITE_PINATA_SECRET_API_KEY=    # Pinata secret API key for IPFS storage
```


###Getting Started
Follow these steps to set up and run Google Drive 3.0 locally:

Clone the Repository:

bash
Copy code
git clone https://github.com/your-username/google-drive-3.0.git
cd google-drive-3.0
Install Dependencies:

bash
Copy code
npm install
Set Up Environment Variables: Create a .env file in the root directory and add the environment variables mentioned above.

Run the Application:

bash
Copy code
npm run dev
Build for Production: To create a production build, run:

bash
Copy code
npm run build
Usage
Uploading Files: Users can upload files, which are encrypted with AES encryption before being stored on IPFS via Pinata.
Sharing Files: Owners can securely share encrypted files with other users and manage access permissions.
Tracking Access: Owners can view a list of users who have access to each file and revoke access if needed.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Contact
For any questions or feedback, please reach out to the project maintainer at your-email@example.com.
