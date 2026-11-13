import React from 'react';
import GalleryHero from './components/GalleryHero';
import GalleryIntroduction from './components/GalleryIntroduction';
import GalleryGrid from './components/GalleryGrid';
import GalleryCTA from "./components/GalleryCTA";
const Gallery = () => {
  return (
    <div>
      <GalleryHero />
      <GalleryIntroduction />
      <GalleryGrid />
      <GalleryCTA />
    </div>
  );
};

export default Gallery;