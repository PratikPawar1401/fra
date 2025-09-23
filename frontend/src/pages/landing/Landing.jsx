import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  // Configuration constants
  const SLIDE_INTERVAL = 5000;
  const PRELOAD_IMAGES = true;
  
  const backgroundImages = [
    '/images/fra1.jpeg',
    '/images/fra2.jpg',
    '/images/fra3.jpg',
    '/images/fra4.webp',
    '/images/fra5.webp'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const intervalRef = useRef(null);

  // Preload images for better performance
  useEffect(() => {
    if (PRELOAD_IMAGES) {
      const preloadImages = async () => {
        const promises = backgroundImages.map((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          });
        });
        await Promise.all(promises);
        setImagesLoaded(true);
      };
      preloadImages();
    } else {
      setImagesLoaded(true);
    }
  }, []);

  // Memoized navigation functions
  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  }, [backgroundImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
  }, [backgroundImages.length]);

  const goToSlide = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  // Auto-play functionality with cleanup
  useEffect(() => {
    if (isPlaying && imagesLoaded) {
      intervalRef.current = setInterval(goToNext, SLIDE_INTERVAL);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, imagesLoaded, goToNext]);

  // Pause on hover for better UX
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      default:
        break;
    }
  }, [goToNext, goToPrevious]);

  // Loading state
  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading Aṭavī Atlas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Carousel */}
      <section 
        className="relative bg-green-600 text-white overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Image carousel showcasing Forest Rights Act initiatives"
        aria-live="polite"
      >
        {/* Background Image Carousel - More Visible Images */}
        <div className="absolute inset-0" role="img" aria-hidden="true">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-90' : 'opacity-0'  // Increased from 50% to 70%
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: '100% auto',
                backgroundPosition: 'center 30%',
                backgroundRepeat: 'no-repeat',
              }}
              aria-hidden="true"
            />
          ))}
          {/* Reduced overlay opacity for clearer images */}
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />  {/* Reduced from /15 to /25 for better text contrast */}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
              Aṭavī Atlas
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 drop-shadow-lg">
              AI-powered FRA Atlas and WebGIS-based Decision Support System
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto drop-shadow-lg">
              Digitizing Forest Rights Act implementation through intelligent mapping, 
              automated document processing, and AI-enhanced scheme recommendations for tribal communities.
            </p>
            <div className="space-x-4">
              <Link 
                to="/map" 
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                Explore WebGIS
              </Link>
              
              <Link 
                to="/dashboard" 
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors shadow-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Simplified Carousel Controls (No Play/Pause) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-4">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="p-2 text-white hover:text-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex space-x-2" role="tablist" aria-label="Carousel navigation">
              {backgroundImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
                    index === currentImageIndex 
                      ? 'bg-white shadow-lg scale-110' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  role="tab"
                  aria-selected={index === currentImageIndex}
                  aria-label={`Go to slide ${index + 1} of ${backgroundImages.length}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="p-2 text-white hover:text-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* About Section - 2 Paragraphs Version */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">What We Are & What We're Solving</h2>
            
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong className="text-green-600">The Challenge:</strong> Forest Rights Act (FRA) implementation across India faces critical bottlenecks including scattered and non-digitized legacy records, manual processing causing delays, lack of transparency in claim tracking, inefficient scheme matching for patta holders, and limited spatial visualization of forest rights data. These challenges particularly affect tribal communities in states like Madhya Pradesh, Tripura, Odisha, and Telangana, where traditional paper-based systems struggle to meet the complex requirements of modern governance and transparency standards.
              </p>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong className="text-green-600">Our Solution:</strong> <strong>Aṭavī Atlas</strong> is an AI-powered platform that revolutionizes FRA implementation through intelligent digitization and spatial analysis. We integrate <strong>geospatial data</strong>, <strong>remote sensing</strong>, and <strong>AI</strong> technologies including layout-aware OCR for document processing, Sentinel-2 satellite imagery analysis for asset mapping, machine learning-driven scheme recommendations, interactive WebGIS for spatial visualization, real-time transparency dashboards, and mobile applications for field workers. This unified platform connects tribal communities with government schemes like PM-KISAN and DAJGUA based on their forest rights and geographical context, transforming how forest rights are managed and implemented across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section - 4 Step Flow */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How to Use Aṭavī Atlas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow this complete workflow from exploration to analytics
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
              <FlowCard
                step="1"
                title="Explore WebGIS"
                description="Start by browsing our interactive maps to explore FRA claims, forest boundaries, tribal settlements, and land use patterns. Use advanced filters and search tools to locate specific areas of interest."
                icon="🗺️"
                bgColor="bg-blue-50"
                borderColor="border-blue-200"
                iconBg="bg-blue-100"
              />
              
              <FlowCard
                step="2"
                title="Upload Claims"
                description="Submit new FRA claims through our secure upload portal. Our AI-powered OCR system automatically extracts data from documents and validates claim information for processing."
                icon="📤"
                bgColor="bg-green-50"
                borderColor="border-green-200"
                iconBg="bg-green-100"
              />
              
              <FlowCard
                step="3"
                title="Track Status & Assets"
                description="Monitor claim progress in real-time and access detailed asset mapping through our Digital Library. View satellite imagery analysis, confidence scores, and document history."
                icon="📋"
                bgColor="bg-yellow-50"
                borderColor="border-yellow-200"
                iconBg="bg-yellow-100"
              />
              
              <FlowCard
                step="4"
                title="Dashboard Analytics"
                description="Access comprehensive analytics and insights through role-based dashboards. View performance metrics, bottleneck analysis, scheme recommendations, and generate detailed reports."
                icon="📊"
                bgColor="bg-purple-50"
                borderColor="border-purple-200"
                iconBg="bg-purple-100"
              />
            </div>

            {/* Flow Arrows */}
            <div className="hidden lg:flex justify-center items-center mt-8">
              <div className="flex items-center space-x-8">
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section - Simplified Feature Names Only */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Platform Features & Capabilities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive AI and geospatial technologies for complete FRA implementation
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* AI-Powered Intelligence Box */}
          <PlatformBox
            icon="🤖"
            title="AI-Powered Intelligence"
            color="bg-blue-50"
            borderColor="border-blue-200"
            features={[
              "Layout-Aware OCR",
              "Machine Learning Models", 
              "Natural Language Processing"
            ]}
          />

          {/* WebGIS & Spatial Analysis Box */}
          <PlatformBox
            icon="🗺️"
            title="WebGIS & Spatial Analysis"
            color="bg-green-50"
            borderColor="border-green-200"
            features={[
              "Interactive Mapping",
              "Spatial Intelligence",
              "Multi-Layer Management"
            ]}
          />

          {/* Data Management Box */}
          <PlatformBox
            icon="💾"
            title="Data Management & Processing"
            color="bg-purple-50"
            borderColor="border-purple-200"
            features={[
              "Secure Data Storage",
              "Real-Time Processing",
              "API Integration"
            ]}
          />

          {/* Analytics & Mobile Box */}
          <PlatformBox
            icon="📊"
            title="Analytics & Mobile Solutions"
            color="bg-orange-50"
            borderColor="border-orange-200"
            features={[
              "Advanced Analytics",
              "Role-Based Dashboards",
              "Mobile Application"
            ]}
          />

        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Transform FRA Implementation Today
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join the digital revolution in forest rights management. Empower tribal communities 
            with transparent, efficient, and AI-enhanced services.
          </p>
          <div className="space-x-4">
            <Link 
              to="/upload" 
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Upload Documents
            </Link>
            <Link 
              to="/library" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Digital Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Flow Card Component for 4-step process
const FlowCard = ({ step, title, description, icon, bgColor, borderColor, iconBg }) => (
  <div className={`${bgColor} ${borderColor} border rounded-xl p-6 shadow-lg text-center relative`}>
    <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <span className="text-3xl">{icon}</span>
    </div>
    <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
      {step}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Simplified Platform Box Component - Feature Names Only
const PlatformBox = ({ icon, title, color, borderColor, features }) => (
  <div className={`${color} ${borderColor} border rounded-xl p-6 shadow-lg h-full`}>
    {/* Header */}
    <div className="text-center mb-6">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>

    {/* Features List - Names Only */}
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="bg-white rounded-lg p-3 shadow-sm text-center">
          <h4 className="font-semibold text-gray-800 text-sm">{feature}</h4>
        </div>
      ))}
    </div>
  </div>
);

export default Landing;
