import React, { useContext } from 'react';
import { MapContext } from '../../context/MapContext';

const VillageDataInfo = () => {
  const { 
    selectedState, 
    selectedDistrict, 
    selectedSubdistrict,
    currentLevel,
    isVillageDataAvailable,
    loadVillages,
    loadingBoundaries 
  } = useContext(MapContext);

  // Don't show if boundaries are disabled or at India level
  if (currentLevel === 'india' || !selectedState) {
    return null;
  }

  const hasVillageData = isVillageDataAvailable(selectedState);

  const handleLoadVillages = () => {
    if (hasVillageData && selectedState) {
      loadVillages(selectedState);
    }
  };

  return (
    <div className="village-info-panel" style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      borderRadius: '6px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '200px',
      fontSize: '14px'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
        Navigation Info
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <strong>State:</strong> {selectedState}
      </div>
      
      {selectedDistrict && (
        <div style={{ marginBottom: '4px' }}>
          <strong>District:</strong> {selectedDistrict}
        </div>
      )}
      
      {selectedSubdistrict && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Subdistrict:</strong> {selectedSubdistrict}
        </div>
      )}
      
      <div style={{ 
        padding: '8px', 
        backgroundColor: hasVillageData ? '#e8f5e8' : '#fff3cd',
        borderRadius: '4px',
        borderLeft: `3px solid ${hasVillageData ? '#28a745' : '#ffc107'}`
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: hasVillageData ? '#155724' : '#856404',
          marginBottom: '4px'
        }}>
          Village Boundaries:
        </div>
        
        {hasVillageData ? (
          <div>
            <div style={{ color: '#155724', marginBottom: '8px' }}>
              ✓ Available for {selectedState}
            </div>
            {currentLevel === 'subdistrict' && selectedSubdistrict && (
              <button
                onClick={handleLoadVillages}
                disabled={loadingBoundaries}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loadingBoundaries ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: loadingBoundaries ? 0.6 : 1
                }}
              >
                {loadingBoundaries ? 'Loading...' : 'Load Villages'}
              </button>
            )}
            {currentLevel !== 'subdistrict' && (
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                Navigate to subdistrict to load villages
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#856404' }}>
            ⚠ Not available for {selectedState}
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Currently only available for Odisha
            </div>
          </div>
        )}
      </div>
      
      {currentLevel === 'village' && (
        <div style={{ 
          marginTop: '8px', 
          padding: '6px', 
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Current Level:</strong> Village View
        </div>
      )}
    </div>
  );
};

export default VillageDataInfo;