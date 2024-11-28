import React from 'react';
import Image from 'next/image';
import '@fontsource/exo-2'; // Add Exo 2 for a futuristic vibe

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white flex flex-col items-center justify-between font-exo">
      {/* Header Section */}
      <header className="w-full flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Stablex Logo" width={48} height={48} priority />
          <h1 className="text-2xl font-bold text-white">Stablex</h1>
        </div>
        <button className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition">
          Connect Wallet
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center flex-1 px-4">
        <h2 className="text-5xl font-extrabold text-white">
          The Future of Decentralized Exchange
        </h2>
        <p className="text-lg text-gray-300 mt-4 max-w-2xl">
          Fast, secure, and reliable trading powered by Solana blockchain.
          Experience lightning-fast transactions and a user-friendly interface.
        </p>
        <button className="mt-8 bg-orange-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition">
          Get Started
        </button>

        {/* Graphic Section */}
        <div className="mt-12 relative">
          <div className="absolute -inset-2 blur-lg bg-gradient-to-r from-blue-500 to-orange-500 opacity-40 rounded-full"></div>
          <Image
            src="/logo.png"
            alt="Stablex Graphic"
            width={192}
            height={192}
            className="relative"
            priority
          />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-900 py-16 px-6 w-full text-center">
        <h3 className="text-3xl font-bold text-orange-500 mb-8">Why Choose Stablex?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-blue-400">Fast Transactions</h4>
            <p className="text-gray-400 mt-2">
              Powered by Solana&apos;s high-speed blockchain, trade instantly with zero lag.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-orange-400">Secure and Reliable</h4>
            <p className="text-gray-400 mt-2">
              Advanced cryptographic algorithms ensure your assets are always safe.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-blue-400">User-Friendly Interface</h4>
            <p className="text-gray-400 mt-2">
              Intuitive and modern design for traders of all levels.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 py-4 text-center">
        <p className="text-gray-500">
          © 2024 Stablex. Powered by Solana Blockchain.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
