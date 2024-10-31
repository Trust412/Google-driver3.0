import { create } from '@web3-storage/w3up-client'

// Replace the old client initialization
const client = await create()
// You'll need to authenticate the client before use

export async function uploadToIPFS(file: File) {
  try {
    // Upload file to IPFS using new client
    const cid = await client.uploadFile(file)
    
    // Generate the IPFS URL (using w3s.link gateway)
    const ipfsUrl = `https://w3s.link/ipfs/${cid}/${file.name}`
    
    return {
      cid,
      url: ipfsUrl
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw error
  }
}