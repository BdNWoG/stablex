"use client";

import React from 'react';
import Image from 'next/image';
import '@fontsource/exo-2';
import { useAddress, useMetamask } from '@thirdweb-dev/react';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const router = useRouter();

  const handleGetStarted = async () => {
    if (!address) {
      await connectWithMetamask();
      // If wallet becomes connected after prompting, navigate to exchange
      if (address) {
        router.push('/exchange');
      }
    } else {
      router.push('/exchange');
    }
  };

  const handleListYourCoin = () => {
    // Navigate to a page where project owners can submit their token details
    router.push('/list-your-coin');
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white flex flex-col items-center justify-between font-exo">
      {/* Header Section */}
      <header className="w-full flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Stablex Logo" width={48} height={48} priority />
          <h1 className="text-2xl font-bold text-white">Stablex</h1>
        </div>
        {address ? (
          <button className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </button>
        ) : (
          <button
            onClick={() => connectWithMetamask()} 
            className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition"
          >
            Connect Wallet
          </button>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center flex-1 px-4">
        <h2 className="text-5xl font-extrabold text-white">
          A New Era of Stable, Decentralized Trading
        </h2>
        <p className="text-lg text-gray-300 mt-4 max-w-2xl">
          Stablex is a decentralized exchange on Solana that combats volatility through 
          an innovative exponential pricing model. Large and frequent trades incur an 
          offset from the market price, fostering sustainable and balanced trading 
          activities. Experience high-speed, low-cost transactions with built-in 
          stability—only on Stablex.
        </p>
        <button
          onClick={handleGetStarted}
          className="mt-8 bg-orange-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition inline-block"
        >
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
            <h4 className="text-xl font-bold text-blue-400">Sustainable Trading</h4>
            <p className="text-gray-400 mt-2">
              Our exponential pricing mechanism disincentivizes volatile, large trades, 
              stabilizing prices for all users.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-orange-400">Secure and Reliable</h4>
            <p className="text-gray-400 mt-2">
              Built on Solana’s robust blockchain, your assets are always protected 
              by advanced cryptography.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-blue-400">Blazing Fast</h4>
            <p className="text-gray-400 mt-2">
              Leverage Solana’s lightning-fast transaction speeds to trade quickly 
              with minimal fees.
            </p>
          </div>
        </div>
      </section>

      {/* List Your Coin Section */}
      <section className="bg-gray-800 py-10 px-6 w-full text-center">
        <h3 className="text-3xl font-bold text-blue-400 mb-4">List Your Token on Stablex</h3>
        <p className="text-gray-300 max-w-3xl mx-auto mb-6">
          Expand your project’s reach by listing on Stablex. Unlock 
          sustainable liquidity and tap into a community that values 
          balanced and fair trading. 
        </p>
        <button
          onClick={handleListYourCoin}
          className="bg-orange-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition"
        >
          List Now
        </button>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 py-4 text-center">
        <p className="text-gray-500">
          © 2024 Stablex. Powered by Solana.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
