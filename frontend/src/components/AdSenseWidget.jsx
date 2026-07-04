import React, { useEffect, useRef } from 'react';

export default function AdSenseWidget({ 
  client = "ca-pub-9239182778221521", 
  slot, 
  format = "auto", 
  responsive = "true", 
  style = { display: "block" } 
}) {
  const adRef = useRef(null);
  
  useEffect(() => {
    // Only push if the ad hasn't been initialized yet
    if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, []);

  return (
    <div className="adsense-container my-4 text-center overflow-hidden flex justify-center w-full">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      ></ins>
    </div>
  );
}
