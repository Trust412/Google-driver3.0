import React, { useCallback } from 'react';
import { Database, Shield, Lock, HardDrive, FileSearch, FileKey } from 'lucide-react';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";


function Home() {
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const floatingAnimation = {
    y: ['-10px', '10px'],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-y-auto">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            opacity: 0
          },
          particles: {
            color: {
              value: "#ffffff"
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1
            },
            number: {
              value: 30
            },
            opacity: {
              value: 0.2
            },
            size: {
              value: { min: 1, max: 3 }
            }
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "connect" // Change mode to "connect"
              },
              onClick: {
                enable: true,
                mode: "push"
              }
            },
            modes: {
              connect: {
                distance: 80, // Adjust distance for connection
                lineLinked: {
                  opacity: 0.5 // Adjust opacity for connection lines
                }
              },
              repulse: {
                distance: 100,
                duration: 0.4
              },
              push: {
                quantity: 4
              }
            }
          }
          
        }}
        className="absolute inset-0"
      />
      
      <div className="flex flex-col h-screen">
        {/* Title Section */}
        <motion.div 
          className="flex-1 flex items-center justify-center p-8 border-b border-gray-700/50"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
           
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
            className="text-8xl font-bold text-center leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              GOOGLE DRIVE
            </span> <br />
            
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              3.
            </span>
            <img
              src="icons/iconSecurity.png"
              alt="Logo"
              className="inline-block w-20 h-20 ml-1 -mt-5"
            />
          </motion.h1>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="flex-1 flex justify-center items-center space-x-8 p-12 border-b border-gray-700/50"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            animate={floatingAnimation}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <Database className="w-12 h-12 text-blue-400 mb-2" />
            <h3 className="font-semibold text-xl">Decentralized</h3>
            <p className="text-gray-400">Powered by IPFS</p>
          </motion.div>

          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <Shield className="w-12 h-12 text-purple-400 mb-2" />
            <h3 className="font-semibold text-xl">Tamper-proof</h3>
            <p className="text-gray-400">Immutable storage</p>
          </motion.div>

          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <Lock className="w-12 h-12 text-green-400 mb-2" />
            <h3 className="font-semibold text-xl">Secure</h3>
            <p className="text-gray-400">End-to-end encrypted</p>
          </motion.div>
        </motion.div>

        {/* Capabilities Section */}
        <motion.div 
          className="flex-1 flex justify-center items-center space-x-8 p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            animate={floatingAnimation}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <HardDrive className="w-12 h-12 text-yellow-400 mb-2" />
            <h3 className="font-semibold text-xl">Store</h3>
            <p className="text-gray-400">Unlimited storage</p>
          </motion.div>

          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <FileSearch className="w-12 h-12 text-red-400 mb-2" />
            <h3 className="font-semibold text-xl">Track</h3>
            <p className="text-gray-400">Real-time monitoring</p>
          </motion.div>

          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center space-y-2 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm transform hover:scale-105 transition-transform"
          >
            <FileKey className="w-12 h-12 text-indigo-400 mb-2" />
            <h3 className="font-semibold text-xl">Confidential</h3>
            <p className="text-gray-400">Your data, your control</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;