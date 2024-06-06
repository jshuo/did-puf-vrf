// components/ImageGrid.js
import React from "react";
import Image from "next/image";

const ImageGrid = () => {
  // Replace these file paths with the actual paths to your local images
  const images = ["/image.png", "/image2.png", "/image.png"];

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-2">
      {images.map((imagePath, index) => (
        <div key={index} className="overflow-hidden">
          <img src={imagePath} alt={`Image ${index + 1}`} width={200} height={150} />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
