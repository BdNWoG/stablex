'use client';

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useAnchorWallet, AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '../../idl.json'; // Replace with your IDL file

const TradingPage = () => {
    const wallet = useAnchorWallet();
    const connection = new Connection('https://api.devnet.solana.com');
    const programId = new PublicKey('YourProgramIdHere'); // Replace with your program ID
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, programId, provider);

    // State variables
    const [marketPrice, setMarketPrice] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);

    // Fetch market price (mock or from backend)
    useEffect(() => {
        const fetchMarketPrice = async () => {
            try {
                // Replace with actual logic to fetch price from the program
                const mockPrice = 100;
                setMarketPrice(mockPrice);
            } catch (error) {
                console.error('Failed to fetch market price:', error);
            }
        };

        fetchMarketPrice();
    }, []);

    // Fetch wallet balance
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                if (wallet) {
                    const balance = await connection.getBalance(wallet.publicKey);
                    setBalance(balance / 1e9); // Convert lamports to SOL
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            }
        };

        fetchBalance();
    }, [wallet]);

    // Handle order submission
    const handleSubmit = async () => {
        if (!wallet) {
            alert('Connect your wallet to place an order.');
            return;
        }

        try {
            // Send transaction to the program
            const tx = await program.methods
                .placeOrder(new anchor.BN(price), new anchor.BN(amount))
                .accounts({
                    market: new PublicKey('YourMarketAccountHere'), // Replace with your Market account
                    user: wallet.publicKey,
                })
                .rpc();

            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Failed to place order:', error);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Trading Dashboard</h1>
                <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                    {wallet ? `Connected: ${wallet.publicKey.toBase58().slice(0, 8)}...` : 'Connect Wallet'}
                </button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Market Overview */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Market Overview</h2>
                    <p className="mt-4">Current Price: <span className="text-green-400">${marketPrice}</span></p>
                </section>

                {/* Wallet Info */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Wallet Info</h2>
                    <p className="mt-4">Balance: <span className="text-green-400">{balance} SOL</span></p>
                </section>

                {/* Order Form */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
                    <h2 className="text-xl font-semibold">Place Order</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="mt-4 space-y-4"
                    >
                        <div>
                            <label className="block mb-2">Order Type</label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value as 'buy' | 'sell')}
                                className="bg-gray-700 text-white p-2 rounded w-full"
                            >
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="bg-gray-700 text-white p-2 rounded w-full"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="bg-gray-700 text-white p-2 rounded w-full"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-orange-500 px-4 py-2 rounded hover:bg-orange-600 w-full"
                        >
                            {orderType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default TradingPage;
