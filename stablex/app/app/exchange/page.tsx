"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "@fontsource/exo-2";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*                         1) STATIC & INITIAL DATA                           */
/* -------------------------------------------------------------------------- */

/** 
 * We have a single token: MYT. 
 * Its price is initially set to 1e-9 USDC per token. 
 */
const INITIAL_PRICE = 1e-9;

/** 
 * We'll store a small static candlestick array, 
 * all set to the initial price of 1e-9. 
 */
const INITIAL_CANDLES = [
  {
    open: 1e-9,
    high: 1e-9,
    low: 1e-9,
    close: 1e-9,
    time: Date.now() - 4 * 60_000, // 4 minutes ago
  },
  {
    open: 1e-9,
    high: 1e-9,
    low: 1e-9,
    close: 1e-9,
    time: Date.now() - 3 * 60_000, // 3 minutes ago
  },
  {
    open: 1e-9,
    high: 1e-9,
    low: 1e-9,
    close: 1e-9,
    time: Date.now() - 2 * 60_000, // 2 minutes ago
  },
  {
    open: 1e-9,
    high: 1e-9,
    low: 1e-9,
    close: 1e-9,
    time: Date.now() - 1 * 60_000, // 1 minute ago
  },
  {
    open: 1e-9,
    high: 1e-9,
    low: 1e-9,
    close: 1e-9,
    time: Date.now(), // current minute
  },
];

/* -------------------------------------------------------------------------- */
/*                     2) HELPER: DRAW CANDLESTICK CHART                      */
/* -------------------------------------------------------------------------- */

/**
 * Renders a candlestick chart with time (x-axis) and price (y-axis).
 * data: array of {open, high, low, close, time} (timestamp in ms).
 */
function drawCandlestickChart(canvas, data) {
  if (!canvas || !data || data.length === 0) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Clear everything
  ctx.clearRect(0, 0, width, height);

  // Margins for axes
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 40;

  // Plot area
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  // Determine min and max price across all candles
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  for (const c of data) {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
  }
  // Pad extremes to prevent candles on the exact edge
  const pad = (maxPrice - minPrice) * 0.05;
  minPrice -= pad;
  maxPrice += pad;

  // Candle spacing
  const candleWidth = (chartWidth / data.length) * 0.7;
  const candleSpacing = chartWidth / data.length;

  // Helper: convert price -> canvas y
  function yPixel(price) {
    return (
      marginTop +
      chartHeight -
      ((price - minPrice) / (maxPrice - minPrice)) * chartHeight
    );
  }

  // Helper: index -> canvas x
  function xPixel(index) {
    return (
      marginLeft + index * candleSpacing + (candleSpacing - candleWidth) / 2
    );
  }

  // Grid lines & Price axis labels
  ctx.strokeStyle = "#555";
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Exo 2, sans-serif";
  ctx.textAlign = "right";

  // Draw ~5 horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const priceVal = minPrice + (i * (maxPrice - minPrice)) / 5;
    const y = yPixel(priceVal);
    ctx.beginPath();
    ctx.moveTo(marginLeft, y);
    ctx.lineTo(width - marginRight, y);
    ctx.stroke();

    // Price label (scientific notation for clarity at 1e-9)
    ctx.fillText(priceVal.toExponential(2), marginLeft - 5, y + 3);
  }

  // Time axis labels 
  ctx.textAlign = "center";
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const x = xPixel(i) + candleWidth / 2;

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, marginTop);
    ctx.lineTo(x, marginTop + chartHeight);
    ctx.stroke();

    // Convert timestamp to HH:MM
    const date = new Date(candle.time);
    const label = `${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
    ctx.fillText(label, x, marginTop + chartHeight + 15);
  }

  // Draw the candlesticks
  for (let i = 0; i < data.length; i++) {
    const { open, close, high, low } = data[i];
    const candleX = xPixel(i);
    const wickX = candleX + candleWidth / 2;

    // Color: green if close >= open, red otherwise
    const isBullish = close >= open;
    ctx.strokeStyle = isBullish ? "#00FF00" : "#FF0000";
    ctx.fillStyle = isBullish ? "#00FF00" : "#FF0000";

    // Wick
    ctx.beginPath();
    ctx.moveTo(wickX, yPixel(high));
    ctx.lineTo(wickX, yPixel(low));
    ctx.stroke();

    // Candle body
    const candleTop = yPixel(Math.max(open, close));
    const candleBottom = yPixel(Math.min(open, close));
    const candleHeight = candleBottom - candleTop;
    ctx.fillRect(
      candleX,
      candleTop,
      candleWidth,
      candleHeight || 1 // If open == close => thin line
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                             3) DYNAMIC ORDERBOOK                           */
/* -------------------------------------------------------------------------- */

/**
 * Given the newPrice, re-center the order book around that price.
 * We'll keep the same sizes but shift the price up/down.
 * This is purely for demonstration.
 */
function generateOrderBookAroundPrice(newPrice) {
  return {
    asks: [
      { price: (newPrice * 1.1).toExponential(9), size: "5000" },
      { price: (newPrice * 1.2).toExponential(9), size: "800" },
      { price: (newPrice * 1.3).toExponential(9), size: "300" },
    ],
    bids: [
      { price: (newPrice * 0.9).toExponential(9), size: "1000" },
      { price: (newPrice * 0.8).toExponential(9), size: "1200" },
      { price: (newPrice * 0.7).toExponential(9), size: "900" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*                         4) MAIN EXCHANGE COMPONENT                         */
/* -------------------------------------------------------------------------- */

const ExchangePage = () => {
  const address = useAddress();
  const disconnectWallet = useDisconnect();
  const router = useRouter();

  // We'll track a single token: MYT
  // Price is initially 1e-9 USDC
  const [price, setPrice] = useState(INITIAL_PRICE);

  // We'll store 2 local balances for demonstration:
  // - userUSDC: how much USDC the user has
  // - userMYT : how many MYT tokens the user has
  const [userUSDC, setUserUSDC] = useState(1000.0); // start with 1000 USDC
  const [userMYT, setUserMYT] = useState(0.0);      // start with 0 MYT

  // Our candlestick data
  const [candles, setCandles] = useState(INITIAL_CANDLES);

  // Our order book, which we'll re-center around new price
  const [orderBook, setOrderBook] = useState(
    generateOrderBookAroundPrice(INITIAL_PRICE)
  );

  // Buy / Sell form inputs
  const [buyQuantity, setBuyQuantity] = useState("");
  const [sellQuantity, setSellQuantity] = useState("");

  // Canvas ref for candlestick chart
  const chartCanvasRef = useRef(null);

  // Redirect to landing if no wallet is connected
  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  // Draw the chart whenever candles changes
  useEffect(() => {
    if (chartCanvasRef.current) {
      drawCandlestickChart(chartCanvasRef.current, candles);
    }
  }, [candles]);

  /**
   * Helper to update the last candle with a new trade price,
   * adjusting high/low/close accordingly.
   */
  function updateCandleWithNewPrice(newPrice) {
    setCandles((prev) => {
      const updated = [...prev];
      const lastCandle = { ...updated[updated.length - 1] };

      // If newPrice is above current high, update high
      if (newPrice > lastCandle.high) lastCandle.high = newPrice;
      // If newPrice is below current low, update low
      if (newPrice < lastCandle.low) lastCandle.low = newPrice;
      // Update close
      lastCandle.close = newPrice;

      updated[updated.length - 1] = lastCandle;
      return updated;
    });
  }

  /**
   * Simple formula to adjust the price each time a trade occurs.
   * - On buy, price goes up slightly
   * - On sell, price goes down slightly
   * You can customize this logic as needed.
   */
  function adjustPriceOnTrade(isBuy, qty) {
    // We'll move the price by 0.0001 * qty.
    let delta = 0.0001 * qty; 

    // For buy, price goes up; for sell, price goes down
    delta = isBuy ? delta : -delta;

    const newPrice = price * (1 + delta);

    // Prevent negative or zero price
    const clampedPrice = newPrice > 0 ? newPrice : 1e-12; 

    // Update the price in state
    setPrice(clampedPrice);
    // Update the candlestick
    updateCandleWithNewPrice(clampedPrice);
    // Update the orderbook around the new price
    setOrderBook(generateOrderBookAroundPrice(clampedPrice));
  }

  // Buy logic
  const handleBuy = () => {
    const qty = parseFloat(buyQuantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      alert("Please enter a valid buy quantity.");
      return;
    }
    // cost in USDC
    const cost = qty * price;
    if (cost > userUSDC) {
      alert("You don't have enough USDC to buy that many MYT.");
      return;
    }

    // Execute trade locally
    setUserUSDC((prev) => prev - cost);
    setUserMYT((prev) => prev + qty);

    // Adjust price & refresh candlestick + order book
    adjustPriceOnTrade(true, qty);

    alert(`You bought ${qty} MYT for ${cost} USDC! (demo only)`);
    setBuyQuantity("");
  };

  // Sell logic
  const handleSell = () => {
    const qty = parseFloat(sellQuantity);
    if (!qty || isNaN(qty) || qty <= 0) {
      alert("Please enter a valid sell quantity.");
      return;
    }
    if (qty > userMYT) {
      alert("You don't have enough MYT to sell.");
      return;
    }

    // proceeds in USDC
    const proceeds = qty * price;

    setUserMYT((prev) => prev - qty);
    setUserUSDC((prev) => prev + proceeds);

    // Adjust price & refresh candlestick + order book
    adjustPriceOnTrade(false, qty);

    alert(`You sold ${qty} MYT for ${proceeds} USDC! (demo only)`);
    setSellQuantity("");
  };

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

      {/* Single Token Info */}
      <nav className="px-6 mb-4">
        <h2 className="text-2xl font-extrabold">MYT/USDC</h2>
        <p className="text-gray-400 mt-2">
          Dummy token on Solana Devnet. Current price:{" "}
          <strong>{price.toExponential(9)} USDC</strong>
        </p>
      </nav>

      {/* Main Exchange Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Balances Display */}
        <div className="flex space-x-8 mt-2">
          <div className="bg-gray-800 p-4 rounded">
            <p className="font-bold">Your USDC Balance</p>
            <p className="text-green-400">{userUSDC.toFixed(9)} USDC</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <p className="font-bold">Your MYT Balance</p>
            <p className="text-blue-400">{userMYT.toFixed(9)} MYT</p>
          </div>
        </div>

        {/* Chart & Order Book Section */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 mt-6">
          {/* Left: Candlestick Chart */}
          <div className="flex-1 bg-gray-900 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">MYT Price Chart</h3>
            <canvas
              ref={chartCanvasRef}
              width={800}
              height={400}
              className="rounded bg-gray-800 border border-gray-700"
            />
          </div>

          {/* Right: Order Book (Dynamic) */}
          <div className="w-full md:w-1/3 bg-gray-900 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Order Book</h3>
            <div className="h-[400px] overflow-y-auto space-y-6">
              {/* Asks */}
              <div>
                <h4 className="font-semibold mb-2 text-red-400">Asks</h4>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-1">Price (USDC)</th>
                      <th className="py-1">Size (MYT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBook.asks.map((ask, i) => (
                      <tr key={`ask-${i}`} className="text-red-400">
                        <td className="py-1">{ask.price}</td>
                        <td className="py-1">{ask.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bids */}
              <div>
                <h4 className="font-semibold mb-2 text-green-400">Bids</h4>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-1">Price (USDC)</th>
                      <th className="py-1">Size (MYT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBook.bids.map((bid, i) => (
                      <tr key={`bid-${i}`} className="text-green-400">
                        <td className="py-1">{bid.price}</td>
                        <td className="py-1">{bid.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Buy/Sell Section */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 mt-6">
          {/* Buy Box */}
          <div className="flex-1 bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-green-400">Buy MYT</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Quantity of MYT"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded bg-gray-800 text-white focus:outline-none text-lg"
              />
              <button
                onClick={handleBuy}
                className="bg-green-600 px-6 py-3 rounded-lg text-white text-lg font-semibold hover:bg-green-700 transition"
              >
                Buy
              </button>
            </div>
          </div>

          {/* Sell Box */}
          <div className="flex-1 bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-red-400">Sell MYT</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Quantity of MYT"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded bg-gray-800 text-white focus:outline-none text-lg"
              />
              <button
                onClick={handleSell}
                className="bg-red-600 px-6 py-3 rounded-lg text-white text-lg font-semibold hover:bg-red-700 transition"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 py-4 text-center">
        <p className="text-gray-500">
          © 2024 Stablex. Powered by Solana (Devnet).
        </p>
      </footer>
    </div>
  );
};

export default ExchangePage;
