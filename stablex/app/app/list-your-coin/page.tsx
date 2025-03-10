"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAddress, useMetamask } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import "@fontsource/exo-2";

const ListYourCoin = () => {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const router = useRouter();

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [projectWebsite, setProjectWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  const handleConnectWallet = async () => {
    if (!address) {
      await connectWithMetamask();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For now, just log the data. Integrate this with your backend or listing logic later.
    console.log("Submitting new token:", {
      tokenName,
      tokenSymbol,
      projectWebsite,
      description,
      contractAddress,
    });
    // You could navigate somewhere after submission, show a success message, etc.
    alert("Your token listing request has been submitted!");
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white flex flex-col font-exo">
      {/* Header Section */}
      <header className="w-full flex justify-between items-center p-6">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={handleLogoClick}
        >
          <Image src="/logo.png" alt="Stablex Logo" width={48} height={48} priority />
          <h1 className="text-2xl font-bold text-white">Stablex</h1>
        </div>
        {address ? (
          <button
            className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition"
            onClick={handleConnectWallet}
          >
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </button>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-600 transition"
          >
            Connect Wallet
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <h2 className="text-4xl font-extrabold mb-6">List Your Token on Stablex</h2>
        <p className="text-gray-300 text-center max-w-md mb-10">
          Provide details about your project to be listed on Stablex. Our team will 
          review your submission and get back to you as soon as possible.
        </p>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-lg"
        >
          <div className="mb-6">
            <label htmlFor="tokenName" className="block mb-2 font-semibold">
              Token Name
            </label>
            <input
              id="tokenName"
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="E.g., MyToken"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="tokenSymbol" className="block mb-2 font-semibold">
              Token Symbol
            </label>
            <input
              id="tokenSymbol"
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="E.g., MTK"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="projectWebsite" className="block mb-2 font-semibold">
              Project Website
            </label>
            <input
              id="projectWebsite"
              type="url"
              value={projectWebsite}
              onChange={(e) => setProjectWebsite(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="E.g., https://mytoken.org"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block mb-2 font-semibold">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none h-32 resize-none"
              placeholder="Give us a brief overview of your project..."
              required
            />
          </div>

          {/* New Contract Address Field */}
          <div className="mb-6">
            <label htmlFor="contractAddress" className="block mb-2 font-semibold">
              Contract Address
            </label>
            <input
              id="contractAddress"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="E.g., 0x1234... or Solana address"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Submit
          </button>
        </form>
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 py-4 text-center">
        <p className="text-gray-500">© 2024 Stablex. Powered by Solana.</p>
      </footer>
    </div>
  );
};

export default ListYourCoin;
