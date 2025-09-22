import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapContext } from '../../context/MapContext';

const StateSpecificControl = () => {
  const map = useMap();
  const { 
    setBoundariesEnabled,
    resetToIndia,
    setLoadingBoundaries,
    boundariesEnabled
  } = useContext(MapContext);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [layerOptions, setLayerOptions] = useState({
    villages: false,
    districts: false,
    subdistricts: false,
    cfrPotential: false
  });

  // Refs to track layers
  const stateLayersRef = useRef({
    villages: null,
    districts: null,
    subdistricts: null,
    cfrPotential: null
  });

  const controlRef = useRef(null);

  const availableStates = [
    { value: 'odisha', label: 'Odisha', hasVillages: true, hasCFR: true },
    { value: 'madhya_pradesh', label: 'Madhya Pradesh', hasVillages: false, hasCFR: false },
    { value: 'tripura', label: 'Tripura', hasVillages: false, hasCFR: false },
    { value: 'telangana', label: 'Telangana', hasVillages: false, hasCFR: false }
  ];

  // Helper functions
  const normalizeStateName = (name) => {
    if (!name) return '';
    return name.toUpperCase().replace(/ /g, '_').replace(/[^A-Z0-9_]/g, '');
  };

  const getStateFolderName = (stateName) => {
    const folderMap = {
      ODISHA: 'ORISSA',
      MADHYA_PRADESH: 'MADHYA PRADESH',
      TELANGANA: 'TELANGANA',
      TRIPURA: 'TRIPURA'
    };
    const normalized = normalizeStateName(stateName);
    return folderMap[normalized] || normalized;
  };

  // Load state boundaries
  const loadStateBoundaries = useCallback(async (stateName, layerType) => {
    try {
      setLoadingBoundaries(true);
      let url, data;

      if (layerType === 'villages' && stateName === 'odisha') {
        url = '/data/odisha_villages.geojson';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        data = await response.json();
      } else if (layerType === 'cfrPotential' && stateName === 'odisha') {
        url = '/data/odisha_cfr_potential.geojson';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        data = await response.json();
      } else {
        const folderName = getStateFolderName(stateName);
        const encodedFolderName = encodeURIComponent(folderName);
        const fileName = folderName === 'ORISSA' ? 
          `ODISHA_${layerType.toUpperCase()}` : 
          `${folderName}_${layerType.toUpperCase()}`;
        const encodedFileName = encodeURIComponent(fileName);
        url = `https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/${encodedFolderName}/${encodedFileName}.geojson`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        data = await response.json();
      }

      if (data.type !== 'FeatureCollection') {
        throw new Error('Invalid GeoJSON format');
      }

      console.log(`${layerType} for ${stateName} loaded successfully. Found ${data.features.length} features.`);
      return data;

    } catch (error) {
      console.error(`Failed to load ${layerType} for ${stateName}:`, error);
      alert(`Failed to load ${layerType} for ${stateName}. ${error.message}`);
      return null;
    } finally {
      setLoadingBoundaries(false);
    }
  }, [setLoadingBoundaries]);

  // Add layer to map
  const addLayerToMap = useCallback((data, layerType, stateName) => {
    if (!data || !map) return null;

    const getLayerStyle = (type) => {
      switch (type) {
        case 'villages':
          return { color: '#e74c3c', weight: 1, fillOpacity: 0.2, fillColor: '#e74c3c' };
        case 'districts':
          return { color: '#ff7733', weight: 2, fillOpacity: 0.1, fillColor: '#ff7733' };
        case 'subdistricts':
          return { color: '#ff4500', weight: 1.5, fillOpacity: 0.1, fillColor: '#ff4500', dashArray: '5, 5' };
        case 'cfrPotential':
          return { color: '#27ae60', weight: 2, fillOpacity: 0.3, fillColor: '#27ae60' };
        default:
          return { color: '#3388ff', weight: 2, fillOpacity: 0.1 };
      }
    };

    const layer = L.geoJSON(data, {
      style: getLayerStyle(layerType),
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        let popupContent = '';

        switch (layerType) {
          case 'villages':
            const villageName = props.NAME || props.vname || props.name || 'Unknown Village';
            const subdistName = props.SUB_DIST || props.subdistrict_name || 'Unknown Subdistrict';
            const distName = props.DISTRICT || props.district_name || 'Unknown District';
            popupContent = `Village: ${villageName}<br>Subdistrict: ${subdistName}<br>District: ${distName}`;
            break;
          case 'districts':
            const districtName = props.dtname || props.DISTRICT || 'Unknown District';
            popupContent = `District: ${districtName}`;
            break;
          case 'subdistricts':
            const subdistrictName = props.sdtname || props.SUB_DIST || 'Unknown Subdistrict';
            const parentDistrict = props.dtname || props.DISTRICT || 'Unknown District';
            popupContent = `Subdistrict: ${subdistrictName}<br>District: ${parentDistrict}`;
            break;
          case 'cfrPotential':
            const cfrName = props.name || props.NAME || 'CFR Potential Area';
            popupContent = `CFR Potential: ${cfrName}`;
            break;
          default:
            popupContent = `${layerType}: ${Object.values(props)[0] || 'Unknown'}`;
        }

        layer.bindPopup(popupContent);
      }
    });

    layer.addTo(map);
    return layer;
  }, [map]);

  // Clear all state-specific layers
  const clearAllStateLayers = useCallback(() => {
    Object.keys(stateLayersRef.current).forEach(layerType => {
      if (stateLayersRef.current[layerType]) {
        try {
          map.removeLayer(stateLayersRef.current[layerType]);
        } catch (error) {
          console.error(`Error removing ${layerType} layer:`, error);
        }
        stateLayersRef.current[layerType] = null;
      }
    });
  }, [map]);

  // Handle state selection
  const handleStateChange = async (stateName) => {
    clearAllStateLayers();
    setSelectedState(stateName);
    setLayerOptions({
      villages: false,
      districts: false,
      subdistricts: false,
      cfrPotential: false
    });

    if (stateName) {
      setBoundariesEnabled(false);
      console.log(`Selected state: ${stateName}`);
    }
  };

  // Handle layer toggle
  const handleLayerToggle = useCallback(async (layerType) => {
    if (!selectedState) return;

    const currentState = layerOptions[layerType];
    const newState = !currentState;
    
    if (newState) {
      // Load and add layer
      const data = await loadStateBoundaries(selectedState, layerType);
      if (data) {
        // Remove existing layer if it exists
        if (stateLayersRef.current[layerType]) {
          try {
            map.removeLayer(stateLayersRef.current[layerType]);
          } catch (error) {
            console.error('Error removing existing layer:', error);
          }
        }

        const layer = addLayerToMap(data, layerType, selectedState);
        if (layer) {
          stateLayersRef.current[layerType] = layer;
          
          // Update state after successful layer addition
          setLayerOptions(prev => ({ ...prev, [layerType]: true }));
          
          // Fit map to layer bounds
          try {
            map.fitBounds(layer.getBounds(), { padding: [20, 20] });
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        } else {
          setLayerOptions(prev => ({ ...prev, [layerType]: false }));
        }
      }
    } else {
      // Remove layer
      if (stateLayersRef.current[layerType]) {
        try {
          map.removeLayer(stateLayersRef.current[layerType]);
          stateLayersRef.current[layerType] = null;
          setLayerOptions(prev => ({ ...prev, [layerType]: false }));
        } catch (error) {
          console.error('Error removing layer:', error);
        }
      }
    }
  }, [selectedState, layerOptions, loadStateBoundaries, addLayerToMap, map]);

  // Handle reset
  const handleReset = () => {
    clearAllStateLayers();
    setSelectedState('');
    setLayerOptions({
      villages: false,
      districts: false,
      subdistricts: false,
      cfrPotential: false
    });
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlRef.current && !controlRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllStateLayers();
    };
  }, [clearAllStateLayers]);

  // Disable main boundaries when using state-specific control
  useEffect(() => {
    if (selectedState && boundariesEnabled) {
      setBoundariesEnabled(false);
    }
  }, [selectedState, boundariesEnabled, setBoundariesEnabled]);

  const currentStateInfo = availableStates.find(state => state.value === selectedState);

  return (
    <div className="absolute top-3 left-42 z-[1003]" ref={controlRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 hover:shadow-xl ${isOpen ? 'rotate-180' : ''}`}
        style={{ 
          width: '48px', 
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="State Boundaries"
      >
        <div className="text-gray-600">
          {isOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )}
        </div>
      </div>

      <div className={`absolute top-14 left-0 transition-all duration-300 ease-in-out transform ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100 z-[1010]' 
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none z-[1003]'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" style={{ width: '280px' }}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">State Boundaries</h3>
            </div>
          </div>
          
          <div className="p-4">
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              {availableStates.map(state => (
                <option key={state.value} value={state.value}>{state.label}</option>
              ))}
            </select>

            {selectedState && (
              <div>
                <div className="mb-3 text-xs text-gray-600">
                  Layers for {currentStateInfo?.label || selectedState}:
                </div>

                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${layerOptions.districts ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={layerOptions.districts}
                      onChange={() => handleLayerToggle('districts')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Districts</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${layerOptions.subdistricts ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={layerOptions.subdistricts}
                      onChange={() => handleLayerToggle('subdistricts')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Subdistricts</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${!currentStateInfo?.hasVillages ? 'opacity-50 cursor-not-allowed' : layerOptions.villages ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={layerOptions.villages}
                      onChange={() => handleLayerToggle('villages')}
                      disabled={!currentStateInfo?.hasVillages}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Villages {!currentStateInfo?.hasVillages ? '(N/A)' : ''}
                    </span>
                  </label>

                  <label className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${!currentStateInfo?.hasCFR ? 'opacity-50 cursor-not-allowed' : layerOptions.cfrPotential ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={layerOptions.cfrPotential}
                      onChange={() => handleLayerToggle('cfrPotential')}
                      disabled={!currentStateInfo?.hasCFR}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      CFR Potential {!currentStateInfo?.hasCFR ? '(N/A)' : ''}
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full mt-4 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateSpecificControl;