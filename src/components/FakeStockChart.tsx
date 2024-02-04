import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, FontSpec } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FakeStockChart = ({ stockSymbol }) => {
  const data = {
    labels: [
      "9 AM", "10 AM", "11 AM", "12 PM", "1 PM",
      "2 PM", "3 PM", "4 PM", "5 PM", "6 PM",
      "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
      "12 AM", "1 AM", "2 AM", "3 AM", "4 AM",
      "5 AM", "6 AM", "7 AM", "8 AM", "9 AM"
    ], // Extended labels
    datasets: [
      {
        label: `${stockSymbol} Stock Price`,
        data: Array.from({ length: 25 }, () => Math.floor(Math.random() * 1000)), // Ensure data array matches label count
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 8, // Reduce font size for legend labels
          },
        },
      },
    
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 7, // Reduce font size for x-axis labels
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 7, // Reduce font size for y-axis labels
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default FakeStockChart;
