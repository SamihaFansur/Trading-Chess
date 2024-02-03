import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  index_name: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ index_name }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new TradingView.widget({
        autosize: true,
        symbol: "NASDAQ:AAPL",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        hide_legend: true,
        withdateranges: true,
        save_image: false,
        hide_volume: true,
        //studies: ['STD;MACD'],
        container_id: containerRef.current?.id,
      });
    };
    document.body.appendChild(script);
  }, [index_name]);

  return (
    <div id="tradingview_ae7da" ref={containerRef} />
  );
};

export default TradingViewWidget;
