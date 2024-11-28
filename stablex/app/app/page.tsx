import React from 'react';

const LandingPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Stablex Exchange</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Connect Wallet
        </button>
      </header>

      <main className="flex flex-col items-center justify-center flex-1">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Welcome to Stablex</h2>
        <p className="text-gray-600 mb-6 text-center">
          A fast, sustainable, and decentralized exchange powered by Solana.
        </p>
        <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600">
          Get Started
        </button>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p>© 2024 Stablex. Built on Solana.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
