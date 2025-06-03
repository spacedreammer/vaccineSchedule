import React, { useEffect, useState } from 'react';

const images = [
  "url('/images/banner1.jpeg')",
  "url('/images/banner.jpeg')",
  "url('/images/bb.avif')",
  "url('/images/healingStart.avif')",
];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => setCurrent(index);

  return (
    <div
      className="w-full h-[400px] bg-cover bg-center transition-all duration-700 relative rounded-sm shadow-md"
      style={{ backgroundImage: images[current] }}
    >
         <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-white text-4xl font-bold font-poppins">Bring your Child for Vaccination</h1>
      </div>
      {/* Overlay (optional for better contrast) */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? 'bg-white' : 'bg-white/50'
            }`}
          ></button>
        ))}
      </div>

      
     
    </div>
  );
};

export default ImageSlider;
