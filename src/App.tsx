import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Home as HomeIcon, HardDrive, FileSearch, Menu, X,LogOut } from 'lucide-react';
import Home from './components/Home';
import Store from './components/Store';
import Track from './components/Track';
import driveABI from './components/driveABI.json';
import { Wallet, Contract,JsonRpcProvider  } from 'ethers';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileAccessCheck from './components/FileAccessCheck';
import PrivateRoute from './components/PrivateRoute';
import { useNavigate } from 'react-router-dom';
function App() {

  const { isLoading, isAuthenticated, user, logout, handleRedirectCallback,loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [fileAccessData, setFileAccessData] = useState<{ cid: string; username: string } | null>(null);


  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const rpcUrl = import.meta.env.VITE_POLYGON_RPC_URL;
  const privateKey = import.meta.env.VITE_PRIVATE_KEY;


  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  
  if (!contractAddress) {
    throw new Error('Environment variable CONTRACT_ADDRESS must be defined');
  }
  const contract = new Contract(contractAddress, driveABI, signer);

  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    // Parse URL parameters when the app loads
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const cid = params.get('cid');
    const username = params.get('username');

    // If we have file access parameters, set them and switch to fileaccess tab
    if (tab === 'fileaccess' && cid && username) {
      setActiveTab('fileaccess');
      setFileAccessData({ cid, username });
    }
  }, []);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (!isAuthenticated && !isLoading) {
        console.log("Redirecting to login page");
        loginWithRedirect({
          appState: {
            returnTo: window.location.pathname + window.location.search,
          },
        });
      } 
      else if (isAuthenticated && window.location.search.includes("code=") && window.location.search.includes("state=")) {
        try {
          const { appState } = await handleRedirectCallback();
          navigate(appState?.returnTo || '/');
        } catch (error) {
          console.error('Error handling redirect callback:', error);
        }
      }
    };

    handleAuthRedirect();
  }, [isAuthenticated, isLoading, handleRedirectCallback, navigate, loginWithRedirect]);

  useEffect(() => {
    const checkAndAddUser = async () => {
      if (isAuthenticated && user?.name && !userChecked) {
        try {
          const users = await contract.getUserList();
          const userExists = users.includes(user.name);
          
          if (!userExists) {
            const tx = await contract.addUser(user.name);
            await tx.wait();
            console.log('New user registered:', user.name);
          } else {
            console.log('User already exists:', user.name);
          }
          setUserChecked(true);
        } catch (error) {
          console.error('Error checking/adding user:', error);
        }
      }
    };

    checkAndAddUser();
  }, [isAuthenticated, user, contract, userChecked]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'store':
        return <Store user={user} contract={contract} />;
      case 'fileaccess':  // Add this case
        // return <FileAccessCheck contract={contract} user={user} />;
        return (
          <FileAccessCheck
            contract={contract}
            user={user}
            cid={fileAccessData?.cid ?? ''}
            username={fileAccessData?.username ?? ''}
          />
        ) 
      case 'track':
        return <Track />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      } z-50 flex flex-col justify-between`}>
        {/* Top section with logo and navigation */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {/* {isSidebarOpen && <h1 className="text-xl font-bold">Drive 3.0</h1>} */}
            {isSidebarOpen && (
              <div className="flex items-center">
                <img 
                  src="icons/iconSecurity.png" 
                  alt="Logo" 
                  className="w-10 h-10 mr-3 " 
                />
                <h1 className="text-2xl font-bold">Drive 3.0</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <nav className="py-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                activeTab === 'home'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <HomeIcon className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-3">Home</span>}
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                activeTab === 'store'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <HardDrive className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-3">Store</span>}
            </button>

            <button
              onClick={() => setActiveTab('fileaccess')}
              className={`w-full flex items-center px-4 py-3 transition-colors ${activeTab === 'fileaccess'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:bg-gray-700'
                }`}
            >
              <FileSearch className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-3">File Access</span>}
            </button>
            {/* <button
              onClick={() => setActiveTab('track')}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                activeTab === 'track'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <FileSearch className="w-6 h-6" />
              {isSidebarOpen && <span className="ml-3">Track</span>}
            </button> */}

          </nav>
        </div>
        

        {/* User profile section */}
        <div className="border-t border-gray-700 p-4">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3 mb-3">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {user?.name?.[0] || user?.email?.[0] || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {user?.name && (
                  <p className="font-medium truncate">{user.name}</p>
                )}
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
      <Routes>
            <Route path="/" element={<PrivateRoute>{renderContent()}</PrivateRoute>} />
            {/* <Route path="/file/:cid" element={
              <PrivateRoute>
                <FileAccessCheck contract={contract} user={user} cid={fileAccessData?.cid ?? ''} username={fileAccessData?.username ?? ''} />
              </PrivateRoute>
            } /> */}
          </Routes>
      </main>
    </div>
  );
}

export default App;