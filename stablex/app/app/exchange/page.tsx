"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "@fontsource/exo-2";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";

/**
 * Generates random candlestick data for demonstration.
 * Each candle: { open, high, low, close, time }
 *    - "time" is a numeric timestamp in milliseconds.
 */
function generateRandomCandleData(numCandles = 40) {
  const data = [];
  let price = 100; // starting reference price
  const now = Date.now();

  for (let i = 0; i < numCandles; i++) {
    // Simplistic random approach
    // 1. "open" is last candle's close or the initial "price"
    // 2. random changes determine high, low, close
    const open = i === 0 ? price : data[i - 1].close;
    const deltaClose = (Math.random() - 0.5) * 4; // random "volatility"
    const close = open + deltaClose;
    const high = Math.max(open, close) + Math.random() * 2; // small random wiggle
    const low = Math.min(open, close) - Math.random() * 2;

    data.push({
      open,
      high,
      low,
      close,
      // For demonstration, let's say each candle = 1 minute apart
      time: now + i * 60_000
    });
  }

  return data;
}

/**
 * Generates random order book data (asks, bids) for demonstration.
 */
function generateRandomOrderBookEntries(count = 8) {
  const asks = [];
  const bids = [];
  // Let's pick a mid-price around 100
  const basePrice = 100 + (Math.random() - 0.5) * 10;

  for (let i = 0; i < count; i++) {
    // Asks: slightly above basePrice
    let askPrice = basePrice + Math.random() * 5;
    let askSize = (Math.random() * 5).toFixed(2);
    asks.push({ price: askPrice.toFixed(2), size: askSize });

    // Bids: slightly below basePrice
    let bidPrice = basePrice - Math.random() * 5;
    let bidSize = (Math.random() * 5).toFixed(2);
    bids.push({ price: bidPrice.toFixed(2), size: bidSize });
  }

  // Sort asks ascending by price, bids descending by price
  asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  return { asks, bids };
}

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
  // Pad extremes by a little to prevent candles on the exact edge
  const pad = (maxPrice - minPrice) * 0.05;
  minPrice -= pad;
  maxPrice += pad;

  // Determine time range
  const minTime = data[0].time;
  const maxTime = data[data.length - 1].time;
  const timeRange = maxTime - minTime || 1;

  // Candle width & spacing
  const candleWidth = chartWidth / data.length * 0.7;
  const candleSpacing = chartWidth / data.length;

  // Helper functions to translate price/time to canvas coordinates
  function yPixel(price) {
    return marginTop + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
  }
  function xPixel(index) {
    return marginLeft + index * candleSpacing + (candleSpacing - candleWidth) / 2;
  }

  // Draw grid lines & price axis labels
  ctx.strokeStyle = "#555";
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Exo 2, sans-serif";
  ctx.textAlign = "right";

  // Let's draw 5 horizontal grid lines/labels
  for (let i = 0; i <= 5; i++) {
    const priceVal = minPrice + (i * (maxPrice - minPrice)) / 5;
    const y = yPixel(priceVal);

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(marginLeft, y);
    ctx.lineTo(width - marginRight, y);
    ctx.stroke();

    // Price label
    ctx.fillText(priceVal.toFixed(2), marginLeft - 5, y + 3);
  }

  // Draw time axis labels (e.g., every 5 candles)
  ctx.textAlign = "center";
  for (let i = 0; i < data.length; i += 5) {
    const candle = data[i];
    const x = xPixel(i) + candleWidth / 2;

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, marginTop);
    ctx.lineTo(x, marginTop + chartHeight);
    ctx.stroke();

    // Convert timestamp to HH:MM or some short format
    const date = new Date(candle.time);
    const label = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    ctx.fillText(label, x, marginTop + chartHeight + 15);
  }

  // Now draw each candle
  for (let i = 0; i < data.length; i++) {
    const { open, close, high, low } = data[i];
    const candleX = xPixel(i);
    const wickX = candleX + candleWidth / 2;

    // Color: green if close >= open, red otherwise
    const isBullish = close >= open;
    ctx.strokeStyle = isBullish ? "#00FF00" : "#FF0000";
    ctx.fillStyle = isBullish ? "#00FF00" : "#FF0000";

    // Wicks
    ctx.beginPath();
    ctx.moveTo(wickX, yPixel(high));
    ctx.lineTo(wickX, yPixel(low));
    ctx.stroke();

    // Candle body
    const candleTop = yPixel(Math.max(open, close));
    const candleBottom = yPixel(Math.min(open, close));
    const candleHeight = candleBottom - candleTop;

    ctx.fillRect(candleX, candleTop, candleWidth, candleHeight || 1); // If open == close, just a line
  }
}

const ExchangePage = () => {
  const address = useAddress();
  const disconnectWallet = useDisconnect();
  const router = useRouter();

  // Available tokens
  const tokens = ["SOL", "BTC", "ETH", "USDC"];
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  // Chart & Order Book data
  const [chartData, setChartData] = useState([]);
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });

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

  // Update chart & order book data when selectedToken changes
  useEffect(() => {
    const newCandleData = generateRandomCandleData(40);
    setChartData(newCandleData);

    const newOrderBook = generateRandomOrderBookEntries(12);
    setOrderBook(newOrderBook);
  }, [selectedToken]);

  // Render the chart whenever chartData changes
  useEffect(() => {
    if (chartCanvasRef.current) {
      drawCandlestickChart(chartCanvasRef.current, chartData);
    }
  }, [chartData]);

  // Handle buy and sell
  const handleBuy = () => {
    if (!buyQuantity || isNaN(Number(buyQuantity))) {
      alert("Please enter a valid buy quantity.");
      return;
    }
    alert(`You bought ${buyQuantity} ${selectedToken}! (demo only)`);
    setBuyQuantity("");
  };

  const handleSell = () => {
    if (!sellQuantity || isNaN(Number(sellQuantity))) {
      alert("Please enter a valid sell quantity.");
      return;
    }
    alert(`You sold ${sellQuantity} ${selectedToken}! (demo only)`);
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

      {/* Token Menu */}
      <nav className="px-6 mb-4">
        <ul className="flex space-x-4">
          {tokens.map((token) => (
            <li
              key={token}
              onClick={() => setSelectedToken(token)}
              className={`cursor-pointer py-3 px-6 rounded text-lg ${
                selectedToken === token ? "bg-orange-500" : "bg-gray-800 hover:bg-gray-700"
              } transition`}
            >
              {token}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Exchange Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        <h2 className="text-3xl font-extrabold mt-2 mb-2">
          Trading {selectedToken}/USD
        </h2>

        {/* Chart & Order Book Section */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 mt-6">
          {/* Left: Candlestick Chart */}
          <div className="flex-1 bg-gray-900 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Price Chart (Candlesticks)</h3>
            <canvas
              ref={chartCanvasRef}
              width={900}
              height={600}
              className="rounded bg-gray-800 border border-gray-700"
            />
          </div>

          {/* Right: Order Book */}
          <div className="w-full md:w-1/2 bg-gray-900 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Order Book</h3>
            <div className="h-[500px] overflow-y-auto space-y-6">
              {/* Asks */}
              <div>
                <h4 className="font-semibold mb-2 text-red-400">Asks</h4>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-1">Price</th>
                      <th className="py-1">Size</th>
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
                      <th className="py-1">Price</th>
                      <th className="py-1">Size</th>
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
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 mt-6">
          {/* Buy Box */}
          <div className="flex-1 bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-green-400">Buy {selectedToken}</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Quantity"
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
            <h3 className="text-xl font-bold mb-4 text-red-400">Sell {selectedToken}</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Quantity"
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
        <p className="text-gray-500">© 2024 Stablex. Powered by Solana.</p>
      </footer>
    </div>
  );
};

export default ExchangePage;
