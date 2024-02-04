import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// Simulated stock price data
const simulatedData = {
  JNJ: Array.from({ length: 25 }, (_, i) => (150 + Math.sin(i / 2) * 10).toFixed(2)),
  MSFT: Array.from({ length: 25 }, (_, i) => (300 + Math.sin(i / 2) * 20).toFixed(2)),
  PG: Array.from({ length: 25 }, (_, i) => (140 + Math.sin(i / 2) * 5).toFixed(2)),
  TSLA: Array.from({ length: 25 }, (_, i) => (800 + Math.sin(i / 2) * 50).toFixed(2)),
  AMZN: Array.from({ length: 25 }, (_, i) => (3500 + Math.sin(i / 2) * 100).toFixed(2)),
};

const generateRandomData = (length: number) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 1000));
};


export const stockDatasets = [
  // Johnson & Johnson (JNJ)
  {
    label: 'Johnson & Johnson (JNJ) - Healthcare',
    data: generateRandomData(25),
    borderColor: 'rgb(255, 99, 132)',
    tension: 0.1,
    borderWidth: 2,
  },
  // Microsoft Corporation (MSFT)
  {
    label: 'Microsoft Corporation (MSFT) - Technology',
    data: generateRandomData(25),
    borderColor: 'rgb(54, 162, 235)',
    tension: 0.1,
    borderWidth: 3,
  },
  // Procter & Gamble Co. (PG)
  {
    label: 'Procter & Gamble Co. (PG) - Consumer Goods',
    data: generateRandomData(25),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1,
    borderWidth: 2,
  },
  // Tesla Inc. (TSLA)
  {
    label: 'Tesla Inc. (TSLA) - Automotive/Electric Vehicles',
    data: generateRandomData(25),
    borderColor: 'rgb(255, 159, 64)',
    tension: 0.1,
    borderWidth: 2,
  },
  // Amazon.com Inc. (AMZN)
  {
    label: 'Amazon.com Inc. (AMZN) - E-commerce/Technology',
    data: generateRandomData(25),
    borderColor: 'rgb(153, 102, 255)',
    tension: 0.1,
    borderWidth: 3,
  },
];



const StockDashboard = () => {
  return (
    <div style={{
      display: 'flex', // Use flex display
      flexDirection: 'column', // Stack children vertically
      justifyContent: 'center', // Center children vertically in the container
      alignItems: 'center', // Center children horizontally in the container
      height: '100vh', // Full height of the viewport
    }}>
      <FakeStockChart stockSymbol="Johnson & Johnson (JNJ) - Healthcare" />
      <FakeStockChart stockSymbol="Microsoft Corporation (MSFT) - Technology" />
      <FakeStockChart stockSymbol="Procter & Gamble Co. (PG) - Consumer Goods" />
      <FakeStockChart stockSymbol="Tesla Inc. (TSLA) - Automotive/Electric Vehicles" />
      <FakeStockChart stockSymbol="Amazon.com Inc. (AMZN) - E-commerce/Technology" />
    </div>
  );
};



// FakeStockChart.tsx
export interface FakeStockChartProps {
  stockSymbol: string;
}

export const FakeStockChart = ({ stockSymbol }: FakeStockChartProps) => {
  const updateInterval = 1000;

  // Find the dataset for the given stockSymbol
  const stockDataset = stockDatasets.find(dataset => dataset.label.includes(stockSymbol)) || stockDatasets[0];

  // Initialize chartData state with the dataset for the stockSymbol
  const [chartData, setChartData] = useState({
    labels: [
      "9 AM", "10 AM", "11 AM", "12 PM", "1 PM",
      "2 PM", "3 PM", "4 PM", "5 PM", "6 PM",
      "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
      "12 AM", "1 AM", "2 AM", "3 AM", "4 AM",
      "5 AM", "6 AM", "7 AM", "8 AM", "9 AM"
    ],
    datasets: [stockDataset], // Use only the dataset for this stock
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new data point
      const newDataPoint = Math.floor(Math.random() * 1000);
      const newLabel = `${chartData.labels.length + 1}`;

      // Update only the dataset for this stock
      const newData = [...chartData.datasets[0].data, newDataPoint];
      newData.shift(); // Remove the first element

      // Update state
      setChartData({
        labels: [...chartData.labels.slice(1), newLabel], // Remove the first label and add a new one
        datasets: [{ ...chartData.datasets[0], data: newData }],
      });
    }, updateInterval);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, [chartData]);

  const options = {
    // ... your existing options ...
  };

  return <Line data={chartData} options={options} />;
};

export default StockDashboard;