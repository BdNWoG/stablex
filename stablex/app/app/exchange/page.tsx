"use client";

import React from 'react';
import Image from 'next/image';
import '@fontsource/exo-2';
import { useAddress, useDisconnect } from '@thirdweb-dev/react';
import { useRouter } from 'next/navigation';

const ExchangePage = () => {
  const address = useAddress();
  const disconnectWallet = useDisconnect();
  const router = useRouter();

  // Redirect to landing page if no wallet is connected
  React.useEffect(() => {
    if (!address) {
      router.push('/');
    }
  }, [address, router]);

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white flex flex-col font-exo">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Stablex Logo" width={48} height={48} priority />
          <h1 className="text-2xl font-bold">Stablex Exchange</h1>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition"
        >
          Disconnect
        </button>
      </header>

      {/* Main Exchange Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <h2 className="text-4xl font-extrabold mb-4">Welcome to Stablex Exchange</h2>
        <p className="text-lg text-gray-300 mb-8">
          Trade tokens securely and efficiently.
        </p>
        {/* Placeholder for the exchange interface */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <p className="text-gray-400">
            Exchange interface coming soon...
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 py-4 text-center">
        <p className="text-gray-500">© 2024 Stablex. Powered by Solana.</p>
      </footer>
    </div>
  );
};

export default ExchangePage;