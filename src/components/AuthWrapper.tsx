import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Shield } from 'lucide-react';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 flex flex-col items-center">
          <Shield className="w-12 h-12 mb-4 animate-bounce" />
          <p className="font-semibold">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Cloud Registry</h1>
          <p className="text-gray-500 mb-8">
            Your Gold Tracker System is now backed by Enterprise-grade Firebase security. Sign in to synchronize your private vault across devices.
          </p>
          <button
            onClick={async () => {
              try {
                await signInWithPopup(auth, googleProvider);
              } catch (err: any) {
                console.error(err);
                if (err?.code === 'auth/unauthorized-domain') {
                  alert(
                    "Action Required: You need to authorize this domain in Firebase.\n\n" +
                    "1. Go to Firebase Console -> Authentication -> Settings -> Authorized domains\n" +
                    "2. Add: " + window.location.hostname + "\n" +
                    "3. Wait a few minutes and try again."
                  );
                } else {
                  alert(err.message || 'Authentication failed.');
                }
              }
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
