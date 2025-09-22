import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapContext } from '../../context/MapContext';

// You'll need to install and import georaster and georaster-layer-for-leaflet
// npm install georaster georaster-layer-for-leaflet
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

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

  // Load TIF file for CFR potential
  const loadCFRTiff = useCallback(async (stateName) => {
    try {
      setLoadingBoundaries(true);
      
      // Update this path to match your TIF file location
      const url = '/data/odisha_cfr_potential.tif';
      
      console.log('Loading CFR TIF file from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get file info
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      console.log('TIF file info:', { contentType, contentLength });
      
      // Check if we got HTML instead of a TIF file
      if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
        const text = await response.text();
        console.log('Received HTML/text content:', text.substring(0, 200) + '...');
        throw new Error(`File not found. Server returned HTML instead of TIF file. Check if the file exists at: ${url}`);
      }
      
      // Check file size - TIF files should be much larger than a few hundred bytes
      const contentLengthNum = parseInt(contentLength);
      if (contentLengthNum && contentLengthNum < 1000) {
        throw new Error(`File seems too small (${contentLengthNum} bytes) to be a valid TIF file. This might be an error page.`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Check magic bytes for TIF format
      const uint8Array = new Uint8Array(arrayBuffer);
      const magicBytes = Array.from(uint8Array.slice(0, 4));
      const isTiff = (magicBytes[0] === 0x49 && magicBytes[1] === 0x49 && magicBytes[2] === 0x2A && magicBytes[3] === 0x00) || // Little endian TIFF
                     (magicBytes[0] === 0x4D && magicBytes[1] === 0x4D && magicBytes[2] === 0x00 && magicBytes[3] === 0x2A);   // Big endian TIFF
      
      if (!isTiff) {
        console.log('File magic bytes:', magicBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        throw new Error('File does not appear to be a valid TIFF file. Check the file format and ensure it\'s a GeoTIFF.');
      }
      
      console.log('Valid TIFF magic bytes detected, attempting to parse...');
      
      // Try different parsing options
      let georaster;
      try {
        // First try with default options
        georaster = await parseGeoraster(arrayBuffer);
      } catch (parseError) {
        console.log('Default parsing failed, trying with options:', parseError.message);
        
        // Try with explicit options
        try {
          georaster = await parseGeoraster(arrayBuffer, {
            cache: false,
            parseValues: true
          });
        } catch (secondError) {
          console.log('Parsing with options failed, trying URL directly:', secondError.message);
          
          // Try parsing from URL instead of buffer
          georaster = await parseGeoraster(url);
        }
      }
      
      console.log('CFR TIF file loaded successfully.');
      console.log('Georaster info:', {
        width: georaster.width,
        height: georaster.height,
        bands: georaster.values ? georaster.values.length : 'unknown',
        bounds: `${georaster.xmin}, ${georaster.ymin}, ${georaster.xmax}, ${georaster.ymax}`,
        projection: georaster.projection
      });
      
      return georaster;
      
    } catch (error) {
      console.error(`Failed to load CFR TIF for ${stateName}:`, error);
      
      // More detailed error message
      let errorMsg = error.message;
      if (error.message.includes('Invalid byte order')) {
        errorMsg = 'TIF file format issue - the file may be corrupted or in an unsupported format.';
      } else if (error.message.includes('File not found') || error.message.includes('HTML instead')) {
        errorMsg = 'TIF file not found at the specified path.';
      }
      
      alert(`Failed to load CFR TIF for ${stateName}.\n\nError: ${errorMsg}\n\nPlease ensure:\n1. The file exists at /data/odisha_cfr_potential.tif\n2. The file is a valid GeoTIFF format\n3. The file is accessible from your web server`);
      return null;
    } finally {
      setLoadingBoundaries(false);
    }
  }, [setLoadingBoundaries]);

  // Load state boundaries (for non-CFR layers)
  const loadStateBoundaries = useCallback(async (stateName, layerType) => {
    try {
      setLoadingBoundaries(true);
      let url, data;

      if (layerType === 'villages' && stateName === 'odisha') {
        url = '/data/odisha_villages.geojson';
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

  // Add TIF layer to map
  const addTiffLayerToMap = useCallback((georaster, layerType) => {
    if (!georaster || !map) return null;

    try {
      // Validate georaster data
      if (!georaster.values || georaster.values.length === 0) {
        throw new Error('No raster data values found');
      }

      console.log('Georaster structure analysis:', {
        valuesType: typeof georaster.values,
        valuesLength: georaster.values.length,
        firstBandType: typeof georaster.values[0],
        firstBandLength: Array.isArray(georaster.values[0]) ? georaster.values[0].length : 'not array',
        noDataValue: georaster.noDataValue,
        mins: georaster.mins,
        maxs: georaster.maxs,
        projection: georaster.projection
      });

      // Check if we need coordinate transformation
      if (georaster.projection && georaster.projection !== 4326) {
        console.warn(`Raster is in projection ${georaster.projection}, but map is likely in EPSG:4326. Consider reprojecting the raster.`);
      }

      // Sample some actual pixel values for debugging (handle Uint8Arrays)
      if (Array.isArray(georaster.values[0]) && georaster.values[0][0]) {
        const firstRow = georaster.values[0][0]; // First row of first band
        if (firstRow && typeof firstRow === 'object' && firstRow.length) {
          const samplePixels = Array.from(firstRow.slice(0, 20));
          console.log('First 20 actual pixel values from band 1:', samplePixels);
        }
      }

      // Create a color ramp for CFR potential visualization
      const colorScale = (value, min, max) => {
        if (value === null || value === undefined || isNaN(value)) {
          return 'rgba(0,0,0,0)'; // Transparent for null/undefined/NaN
        }
        
        // For uint8 data, 0 is often background/nodata
        if (value === 0) {
          return 'rgba(0,0,0,0)'; // Transparent for zero values
        }
        
        // Check for noData values
        if (georaster.noDataValue !== undefined && value === georaster.noDataValue) {
          return 'rgba(0,0,0,0)'; // Transparent for noData
        }
        
        // Handle edge case where min === max
        if (min === max) {
          return 'rgba(0,255,0,0.7)'; // Default green
        }
        
        // Normalize value between 0 and 1 (excluding zero values)
        const effectiveMin = Math.max(min, 1); // Start from 1 instead of 0
        const normalized = Math.max(0, Math.min(1, (value - effectiveMin) / (max - effectiveMin)));
        
        // Create a green color ramp (darker green = higher potential)
        const red = Math.floor(255 * (1 - normalized));
        const green = 255;
        const blue = Math.floor(255 * (1 - normalized));
        const alpha = 0.8; // More opaque for better visibility
        
        return `rgba(${red},${green},${blue},${alpha})`;
      };

      // Get min/max values for color scaling
      let minValue, maxValue;
      
      // Use the built-in mins/maxs (which we know are 0-255)
      if (georaster.mins && georaster.maxs && georaster.mins.length > 0) {
        minValue = georaster.mins[0]; // Use first band
        maxValue = georaster.maxs[0];
        console.log('Using georaster built-in min/max:', { minValue, maxValue });
      } else {
        // Fallback to default uint8 range
        minValue = 0;
        maxValue = 255;
      }

      console.log('CFR TIF statistics:', {
        totalPixels: georaster.width * georaster.height,
        valueRange: `${minValue} to ${maxValue}`,
        noDataValue: georaster.noDataValue,
        bands: georaster.values.length,
        dataType: 'Uint8 (0-255)',
        projection: georaster.projection
      });

      const geoRasterLayer = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.8,
        pixelValuesToColorFn: (pixelValues) => {
          // Use first band for visualization
          const pixelValue = pixelValues[0];
          return colorScale(pixelValue, minValue, maxValue);
        },
        resolution: 512, // Higher resolution for better quality
        // Add debugging
        debugLevel: 1
      });

      geoRasterLayer.addTo(map);
      
      console.log('CFR Potential TIF layer added successfully');
      
      // Transform bounds from UTM to WGS84 for proper fitting
      // Note: This is approximate transformation - for precise work, use proj4js
      if (georaster.projection === 32644) {
        // UTM Zone 44N to rough lat/lon conversion for Odisha region
        // This is a rough approximation - consider using proj4js for accuracy
        const utmBounds = {
          xmin: georaster.xmin,
          ymin: georaster.ymin,
          xmax: georaster.xmax,
          ymax: georaster.ymax
        };
        
        console.log('UTM bounds:', utmBounds);
        console.log('Note: Raster is in UTM projection. Consider reprojecting to EPSG:4326 for web maps.');
        
        // Don't auto-fit to UTM bounds as they won't make sense in web mercator
        // Instead, let user manually navigate to the area
      }
      
      return geoRasterLayer;
    } catch (error) {
      console.error('Error adding TIF layer to map:', error);
      alert(`Error displaying TIF layer: ${error.message}`);
      return null;
    }
  }, [map]);

  // Add layer to map (for GeoJSON layers)
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
    
    // Force map refresh to ensure all layers are properly updated
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
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
      let layer = null;
      
      if (layerType === 'cfrPotential' && selectedState === 'odisha') {
        // Handle CFR TIF file
        const georaster = await loadCFRTiff(selectedState);
        if (georaster) {
          // Remove existing layer if it exists
          if (stateLayersRef.current[layerType]) {
            try {
              map.removeLayer(stateLayersRef.current[layerType]);
            } catch (error) {
              console.error('Error removing existing CFR layer:', error);
            }
          }

          layer = addTiffLayerToMap(georaster, layerType);
          if (layer) {
            stateLayersRef.current[layerType] = layer;
            setLayerOptions(prev => ({ ...prev, [layerType]: true }));
            
            // Don't auto-fit to UTM bounds - instead zoom to Odisha region in lat/lon
            try {
              // Approximate bounds for Odisha state in lat/lon
              const odishaBounds = [
                [17.8, 81.3], // Southwest corner
                [22.6, 87.5]  // Northeast corner
              ];
              map.fitBounds(odishaBounds, { padding: [20, 20] });
              console.log('Zoomed to Odisha region instead of UTM bounds');
            } catch (error) {
              console.error('Error fitting bounds to Odisha:', error);
            }
          }
        }
      } else {
        // Handle regular GeoJSON layers
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

          layer = addLayerToMap(data, layerType, selectedState);
          if (layer) {
            stateLayersRef.current[layerType] = layer;
            setLayerOptions(prev => ({ ...prev, [layerType]: true }));
            
            // Only fit bounds if no CFR layer is active (to avoid zoom conflicts)
            if (!layerOptions.cfrPotential) {
              try {
                map.fitBounds(layer.getBounds(), { padding: [20, 20] });
              } catch (error) {
                console.error('Error fitting bounds:', error);
              }
            } else {
              // If CFR layer exists, just refresh the map
              setTimeout(() => {
                map.invalidateSize();
              }, 100);
            }
          }
        }
      }
      
      if (!layer) {
        setLayerOptions(prev => ({ ...prev, [layerType]: false }));
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
  }, [selectedState, layerOptions, loadStateBoundaries, loadCFRTiff, addLayerToMap, addTiffLayerToMap, map]);

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

                  <label className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${!currentStateInfo?.hasCFR ? 'opacity-50 cursor-not-allowed' : layerOptions.cfrPotential ? 'bg-green-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={layerOptions.cfrPotential}
                      onChange={() => handleLayerToggle('cfrPotential')}
                      disabled={!currentStateInfo?.hasCFR}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      CFR Potential (TIF) {!currentStateInfo?.hasCFR ? '(N/A)' : ''}
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