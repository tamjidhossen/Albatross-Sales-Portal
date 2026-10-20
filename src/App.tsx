import React, { useState, useEffect } from 'react';
import { BackgroundDoodles } from './components/landing/BackgroundDoodles';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { StreetTicker } from './components/landing/StreetTicker';
import { ComboShowcase } from './components/landing/ComboShowcase';
import { MenuBoard } from './components/landing/MenuBoard';
import { CartGallery } from './components/landing/CartGallery';
import { LocationBanner } from './components/landing/LocationBanner';
import { Footer } from './components/landing/Footer';
import { FloatingMobileBar } from './components/landing/FloatingMobileBar';
import { AdminLayout } from './components/admin/AdminLayout';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: 'landing' | 'admin') => {
    setCurrentRoute(route);
    const path = route === 'admin' ? '/admin/dashboard' : '/';
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRoute === 'admin') {
    return <AdminLayout onBackToLanding={() => navigateTo('landing')} />;
  }

  return (
    <div className="relative min-h-screen text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-red-950 overflow-x-hidden bg-noise">
      
      {/* Background Floating SVG Food Doodles */}
      <BackgroundDoodles />

      {/* Sleek Floating Glass Navbar with Direct Order Button */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        
        {/* Hero Section with Massive Typography, Floating Polaroids & Glowing Logo */}
        <HeroSection />

        {/* Infinite Street Marquee Ticker */}
        <StreetTicker />

        {/* Viral Combo Deals Section (Gulte 160 TK, Special 220 TK, Pizza Combos) */}
        <ComboShowcase />

        {/* Official Scanned Menu Poster (Clean presentation, no repetitive list) */}
        <MenuBoard />

        {/* Straight from the Red Cart Photo Gallery */}
        <CartGallery />

        {/* Circuit House Field Location & Delivery Banner */}
        <LocationBanner />

      </main>

      {/* Footer with Bengali Motto, Messenger CTA & Discreet Admin Portal Link */}
      <Footer onNavigateToAdmin={() => navigateTo('admin')} />

      {/* Mobile Floating Order Bar */}
      <FloatingMobileBar />

    </div>
  );
}

export default App;

