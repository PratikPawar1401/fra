import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Map, Satellite, BarChart3, Info, ZoomIn, ZoomOut, Home, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ViewGIS = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  
  const [claim, setClaim] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [classifiedLayer, setClassifiedLayer] = useState(null);
  const [boundaryLayer, setBoundaryLayer] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

  // Initialize map when content is rendered (after loading/error check)
  useEffect(() => {
    if (loading || error || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        const map = L.map(mapRef.current).setView([20.9517, 85.0985], 8);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 18
        }).addTo(map);

        mapInstance.current = map;
        setIsMapReady(true);
        console.log("✅ Map initialized successfully");

      } catch (error) {
        console.error("❌ Map initialization failed:", error);
        setError("Failed to initialize map. Please refresh the page.");
      }
    };

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setIsMapReady(false);
      }
    };
  }, [loading, error]);

  // Add classified layer when analytics and map are ready
  useEffect(() => {
    if (!analytics?.satellite_image_url || !mapInstance.current || !isMapReady) {
      console.log('⚠️ Skipping classified layer add:', {
        hasAnalytics: !!analytics,
        hasSatelliteUrl: !!analytics?.satellite_image_url,
        hasMap: !!mapInstance.current,
        isMapReady
      });
      return;
    }

    const addClassifiedLayer = async () => {
      try {
        const L = await import('leaflet');
        
        console.log('🗺️ Adding classified layer with URL:', analytics.satellite_image_url);
        
        if (classifiedLayer) {
          console.log('🗑️ Removing old classified layer');
          mapInstance.current.removeLayer(classifiedLayer);
        }
        
        const newClassifiedLayer = L.tileLayer(analytics.satellite_image_url, {
          attribution: 'Land Classification © Google Earth Engine',
          maxZoom: 18,
          minZoom: 1,
          opacity: 0.7,
          crossOrigin: true
        }).addTo(mapInstance.current);
        
        newClassifiedLayer.on('loading', () => console.log('🔄 Tiles loading...'));
        newClassifiedLayer.on('load', () => console.log('✅ Tiles loaded successfully'));
        newClassifiedLayer.on('tileerror', (e) => console.error('❌ Tile load error:', e));
        
        setClassifiedLayer(newClassifiedLayer);
        console.log('✅ Classified layer added to map');
      } catch (error) {
        console.error('❌ Error adding classified layer:', error);
      }
    };
    addClassifiedLayer();
  }, [analytics, isMapReady]);

  // Load boundary automatically when claim and map are ready
  useEffect(() => {
    if (!claim?.geojson_file_url || !mapInstance.current || boundaryLayer || !isMapReady) return;

    const loadBoundary = async () => {
      try {
        const response = await fetch(claim.geojson_file_url);
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        const text = await response.text();
        const geojsonData = JSON.parse(text);
        const L = await import('leaflet');
        const newBoundaryLayer = L.geoJSON(geojsonData, {
          style: {
            color: "#ff7800",
            weight: 3,
            fillOpacity: 0.1,
            dashArray: "5, 5"
          }
        }).addTo(mapInstance.current);
        setBoundaryLayer(newBoundaryLayer);
        mapInstance.current.fitBounds(newBoundaryLayer.getBounds());
        console.log('✅ Boundary loaded automatically');
      } catch (err) {
        console.error('Failed to load boundary:', err);
        setError('Failed to load claim boundary');
      }
    };
    loadBoundary();
  }, [claim, isMapReady, boundaryLayer]);

  // Auto-process analysis if no analytics (DB mode)
  useEffect(() => {
    if (claim && claim.geojson_file_url && !analytics && !uploading && !error) {
      processGeoJSONAnalysis();
    }
  }, [claim, analytics, uploading, error]);

  // Debug analytics state
  useEffect(() => {
    console.log('🔍 Analytics state changed:', analytics);
    if (analytics) {
      console.log('📊 Analytics.analytics:', analytics.analytics);
      console.log('📊 Analytics keys:', Object.keys(analytics));
    }
  }, [analytics]);

  // Load claim and WebGIS data on mount
  useEffect(() => {
    if (claimId) {
      loadClaimData();
    }
  }, [claimId]);

  const loadClaimData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}`);
      
      if (response.ok) {
        const data = await response.json();
        setClaim(data.claim);
      } else {
        setError('Claim not found');
      }
    } catch (error) {
      setError('Error loading claim data');
      console.error('Error loading claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWebGISData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/webgis/claim/${claimId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.gee_analysis) {
          setAnalytics(data.gee_analysis);
          console.log('✅ Loaded existing WebGIS data');
        } else {
          console.log('ℹ No existing WebGIS data, will auto-analyze');
        }
      }
    } catch (err) {
      console.error('Failed to load WebGIS data:', err);
    }
  };

  const processGeoJSONAnalysis = async () => {
    if (!claim?.id) {
      setError('No claim ID found');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log(`🚀 Auto-analyzing claim ${claimId}`);
      const response = await fetch(`${API_BASE_URL}/webgis/analyze-claim-auto/${claimId}`, { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        let analysisResults = data.success && data.gee_analysis ? data.gee_analysis : null;
        if (!analysisResults) throw new Error('Unexpected response format');
        setAnalytics(analysisResults);
        console.log('✅ Analysis complete');
      } else {
        throw new Error(data.detail || `Analysis failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const displayResults = async (analysisData, geojsonFile) => {
    // Optional for local upload; auto-useEffect handles DB
    if (!mapInstance.current || !isMapReady) return;
    // ... (keep existing boundary from file logic if needed for upload)
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'Forest': return 'bg-green-500';
      case 'Agriculture': return 'bg-yellow-500';
      case 'Urban & Barren Land': return 'bg-gray-500';
      case 'Water & Wetland': return 'bg-blue-500';
      case 'Shrub & Grassland': return 'bg-orange-500';
      default: return 'bg-purple-500';
    }
  };

  const goBack = () => {
    navigate('/library');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WebGIS data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={goBack}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Digital Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Digital Library
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Satellite className="mr-3 text-green-600" size={24} />
                  🌳 Aṭavī Atlas - WebGIS Analysis
                </h1>
                {claim && (
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-gray-600">
                      <strong>Claim:</strong> FRA-{claim.id.toString().padStart(3, '0')}
                    </p>
                    <p className="text-gray-600">
                      <strong>Applicant:</strong> {claim.claimant_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Google Earth Engine
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Map Container */}
          <div className="flex-1 lg:flex-[2] relative bg-white rounded-lg shadow overflow-hidden">
            <div 
              ref={mapRef} 
              className="w-full h-full"
              style={{ minHeight: '400px', height: '100%' }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2 z-10">
              <button
                onClick={() => mapInstance.current?.zoomIn()}
                className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => mapInstance.current?.zoomOut()}
                className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => mapInstance.current?.setView([20.9517, 85.0985], 8)}
                className="block w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600"
                title="Reset View"
              >
                <Home size={16} />
              </button>
            </div>

            {/* Loading Overlay for upload/analysis */}
            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Processing satellite analysis...</p>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-green-600" size={20} />
                  Claim Boundary Analysis
                </h3>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="text-blue-600 mr-2 mt-0.5" size={16} />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Automatic Analysis (DB Mode):</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Boundary loaded from claim data</li>
                        <li>• Satellite analysis running automatically if not in DB</li>
                        <li>• Using Sentinel-2 imagery via Google Earth Engine</li>
                      </ul>
                      <p className="mt-2 font-medium">Or Upload GeoJSON for Manual Override:</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="text-red-600 mr-2" size={16} />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Analytics Display */}
                {analytics && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <CheckCircle className="mr-2 text-green-600" size={16} />
                      Analysis Results
                    </h4>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-500">
                      <h5 className="font-medium text-green-800 mb-2">Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Total Area:</span>
                          <span className="font-medium text-green-900">
                            {analytics.total_area_hectares ? `${analytics.total_area_hectares} ha` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Forest Coverage:</span>
                          <span className="font-medium text-green-900">
                            {analytics.forest_coverage_percent ? `${analytics.forest_coverage_percent}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {analytics.analytics && Object.keys(analytics.analytics).length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-800">Land Classification Breakdown</h5>
                        
                        {Object.entries(analytics.analytics).map(([landType, area]) => {
                          const numericArea = parseFloat(area) || 0;
                          const totalArea = analytics.total_area_hectares || 100;
                          const percentage = totalArea > 0 ? ((numericArea / totalArea) * 100).toFixed(1) : '0';
                          
                          return (
                            <div key={landType} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-3 ${getColorClass(landType)}`}></div>
                                  <span className="font-medium text-gray-900">{landType}</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{percentage}%</span>
                              </div>
                              <div className="mb-3">
                                <span className="text-sm text-gray-600">
                                  Area: {numericArea.toFixed(2)} hectares
                                </span>
                              </div>
                              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${getColorClass(landType)}`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Refresh button for re-analysis */}
                <button
                  onClick={processGeoJSONAnalysis}
                  disabled={uploading || !claim?.geojson_file_url}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={16} className="mr-2" />
                      Refresh Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Satellite size={12} className="mr-1" />
                  Google Earth Engine
                </div>
                <div>🌳 Aṭavī Atlas v1.0.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGIS;