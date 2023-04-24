// TradingViewWidget.jsx

import React, { useEffect, useRef } from "react";

let tvScriptLoadingPromise;

export default function TradingViewWidget() {
  const onLoadScriptRef = useRef();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (document.getElementById("tradingview_9cfa3") && "TradingView" in window) {
        new window.TradingView.widget({
          symbol: "COINBASE:ARBUSD",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en_US",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "tradingview_9cfa3",
          height: 450,
          width: "100%",
          hide_top_toolbar: true,
        });
      }
    }
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview_9cfa3" />
    </div>
  );
}
