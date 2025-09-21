import React from 'react';
import { Link } from 'react-router-dom';
import { MapContext } from '../../context/MapContext';

const Header = () => {
  const { 
    currentLevel, 
    selectedState, 
    selectedDistrict, 
    resetToIndia, 
    setCurrentLevel, 
    setSelectedState, 
    setSelectedDistrict,
    setFilters 
  } = React.useContext(MapContext);

  // Reset to India level
  const handleResetToCountry = () => {
    console.log('Navigating back to India level');
    resetToIndia();
  };

  // Reset to state level
  const handleResetToState = () => {
    if (selectedState) {
      console.log(`Navigating back to state: ${selectedState}`);
      setCurrentLevel('state');
      setSelectedDistrict(null);
      setFilters((prev) => ({ ...prev, district: '', village: '', tribalGroup: '' }));
    }
  };

  // Reset to district level
  const handleResetToDistrict = () => {
    if (selectedDistrict) {
      console.log(`Navigating back to district: ${selectedDistrict}`);
      setCurrentLevel('district');
      setFilters((prev) => ({ ...prev, village: '', tribalGroup: '' }));
    }
  };

  return (
    <header className="bg-green-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold mr-4">
          Atavi Atlas
        </Link>
        <div className="text-sm">
          <span 
            className={`cursor-pointer ${currentLevel === 'india' ? 'font-bold' : 'underline'}`} 
            onClick={handleResetToCountry}
          >
            India
          </span>
          {selectedState && (
            <>
              {' > '}
              <span 
                className={`cursor-pointer ${currentLevel === 'state' ? 'font-bold' : 'underline'}`} 
                onClick={handleResetToState}
              >
                {selectedState}
              </span>
            </>
          )}
          {selectedDistrict && (
            <>
              {' > '}
              <span 
                className={`cursor-pointer ${currentLevel === 'district' ? 'font-bold' : 'underline'}`} 
                onClick={handleResetToDistrict}
              >
                {selectedDistrict}
              </span>
            </>
          )}
        </div>
      </div>

      <nav className="flex space-x-6">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/map" className="hover:underline">WebGIS</Link>
        <Link to="/upload" className="hover:underline">Upload</Link>
        <Link to="/library" className="hover:underline">Digital Library</Link>  
      </nav>
    </header>
  );
};

export default Header;