// import { useAuth0 } from '@auth0/auth0-react';
// import { Loader } from 'lucide-react';

// function AuthWrapper({ children }: { children: React.ReactNode }) {
//   const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
//         <Loader className="w-8 h-8 text-blue-400 animate-spin" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white">
//         <h1 className="text-4xl font-bold mb-8">Welcome to Drive 3.0</h1>
//         <button
//           onClick={() => loginWithRedirect()}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//         >
//           Log In to Continue
//         </button>
//       </div>
//     );
//   }

//   return <>{children}</>;
// }

// export default AuthWrapper;

