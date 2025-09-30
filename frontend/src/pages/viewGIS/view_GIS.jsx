import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Satellite, BarChart3, Info, ZoomIn, ZoomOut, Home, AlertCircle, CheckCircle, MapPin, Target, Lightbulb, ExternalLink, BellRing } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// ============================================================================
// AI DECISION SUPPORT - SCHEME RECOMMENDATION COMPONENT
// ============================================================================

const SchemeRecommendationCard = ({ recommendation, index }) => {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return { badge: 'bg-red-100 text-red-800 border-red-300', border: 'border-red-500' };
      case 'Medium':
        return { badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', border: 'border-yellow-500' };
      case 'Low':
        return { badge: 'bg-green-100 text-green-800 border-green-300', border: 'border-green-500' };
      default:
        return { badge: 'bg-gray-100 text-gray-800 border-gray-300', border: 'border-gray-400' };
    }
  };

  const priorityStyles = getPriorityStyles(recommendation.priority);

  return (
    <div className={`bg-white border border-gray-200 border-l-4 rounded-r-lg p-5 ${priorityStyles.border} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-gray-800 pr-4">
          <span className="font-normal text-gray-500">{index + 1}. </span>
          {recommendation.name}
        </h4>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${priorityStyles.badge}`}>
          {recommendation.priority} Priority
        </span>
      </div>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Lightbulb className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-blue-800">Why it's recommended:</p>
            <p className="text-blue-700">{recommendation.reason}</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-gray-700 text-sm">{recommendation.description}</p>
      </div>
      <a href={recommendation.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors group">
        Learn More & Apply
        <ExternalLink size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
};

const SchemeRecommendations = ({ recommendations, onSendNotifications, notificationStatus }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const renderButton = () => {
    switch (notificationStatus) {
      case 'sending':
        return (
          <button disabled className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending...
          </button>
        );
      case 'sent':
        return (
          <button disabled className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg">
            <CheckCircle size={16} className="mr-2" />
            Sent!
          </button>
        );
      default: // 'idle'
        return (
          <button
            onClick={onSendNotifications}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <BellRing size={16} className="mr-2" />
            Send Notifications
          </button>
        );
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <Target className="mr-3 text-green-600" size={24} />
          AI Decision Support: Scheme Recommendations
        </h3>
        {renderButton()}
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <SchemeRecommendationCard key={rec.id} recommendation={rec} index={index} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VIEWGIS COMPONENT
// ============================================================================

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
  const [notificationStatus, setNotificationStatus] = useState('idle'); // idle, sending, sent

  const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

  // AI Logic to generate scheme recommendations based on analytics data.
  // This useMemo hook ensures recommendations are calculated only when 'analytics' data is available.
  const recommendedSchemes = useMemo(() => {
    if (!analytics || !analytics.analytics) {
      return [];
    }
    const landData = analytics.analytics;
    const totalArea = analytics.total_area_hectares || 1;
    let schemes = [];
    const agricultureArea = parseFloat(landData['Agriculture'] || 0);
    if (agricultureArea / totalArea > 0.4) {
      schemes.push({id: 'pm-kisan', name: 'PM Kisan Samman Nidhi', priority: 'High', reason: `Significant land use for agriculture (${(agricultureArea / totalArea * 100).toFixed(0)}%).`, description: 'Provides income support to landholding farmer families for agriculture-related inputs.', link: 'https://pmkisan.gov.in/'});
    }
    const waterArea = parseFloat(landData['Water & Wetland'] || 0);
    if (waterArea > 0.1) {
      schemes.push({id: 'pmmsy', name: 'Pradhan Mantri Matsya Sampada Yojana', priority: 'Medium', reason: `A water body of ${waterArea.toFixed(2)} ha is present, suitable for developing fisheries.`, description: 'Aims to bring about a Blue Revolution through sustainable development of the fisheries sector.', link: 'https://dof.gov.in/pmmsy'});
    }
    const forestArea = parseFloat(landData['Forest'] || 0);
    if (forestArea / totalArea > 0.6) {
        schemes.push({id: 'ntfp', name: 'Van Dhan Vikas Yojana (VDVY)', priority: 'High', reason: 'Claimed area is predominantly forest land, ideal for Minor Forest Produce (MFP) collection.', description: 'Provides livelihood support for tribal MFP gatherers by promoting value addition to MFP.', link: 'https://trifed.tribal.gov.in/schemes/van-dhan-yojana'});
    }
    schemes.push({id: 'mgnrega', name: 'Mahatma Gandhi NREGA', priority: 'Low', reason: 'Provides a legal guarantee for wage employment as a supplementary livelihood source for rural households.', description: 'Enhances livelihood security by providing at least 100 days of guaranteed wage employment in a financial year.', link: 'https://nrega.nic.in/'});
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return Array.from(new Set(schemes.map(s => s.id))).map(id => schemes.find(s => s.id === id)).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [analytics]);

  const handleSendNotifications = async () => {
    if (recommendedSchemes.length === 0 || !claim) {
      alert("No recommendations available to send.");
      return;
    }
    setNotificationStatus('sending');
    console.log("Preparing to send notifications for Claim ID:", claim.id);
    const payload = {
      claimant_name: claim.claimant_name,
      claim_id: claim.id,
      recommendations: recommendedSchemes.map(s => ({ name: s.name, priority: s.priority, link: s.link })),
    };
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    // Simulate API call
    setTimeout(() => {
      setNotificationStatus('sent');
      alert(`Notifications for ${recommendedSchemes.length} scheme(s) have been sent to ${claim.claimant_name}.`);
      
      // Reset button state after 3 seconds
      setTimeout(() => setNotificationStatus('idle'), 3000);
    }, 2000);
  };

  // --- Other hooks and functions from your original code ---

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
        if (mapInstance.current) mapInstance.current.remove();
        const map = L.map(mapRef.current).setView([20.9517, 85.0985], 8);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri', maxZoom: 18
        }).addTo(map);
        mapInstance.current = map;
        setIsMapReady(true);
      } catch (e) { setError("Failed to initialize map."); }
    };
    initializeMap();
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; setIsMapReady(false); }
    };
  }, [loading, error]);

  useEffect(() => {
    if (!analytics?.satellite_image_url || !mapInstance.current || !isMapReady) return;
    const addClassifiedLayer = async () => {
      try {
        const L = await import('leaflet');
        if (classifiedLayer) mapInstance.current.removeLayer(classifiedLayer);
        const newLayer = L.tileLayer(analytics.satellite_image_url, {
          attribution: 'Land Classification © Google Earth Engine', opacity: 0.7
        }).addTo(mapInstance.current);
        setClassifiedLayer(newLayer);
      } catch (e) { console.error('Error adding classified layer:', e); }
    };
    addClassifiedLayer();
  }, [analytics, isMapReady]);

  useEffect(() => {
    if (!claim?.geojson_file_url || !mapInstance.current || boundaryLayer || !isMapReady) return;
    const loadBoundary = async () => {
      try {
        const response = await fetch(claim.geojson_file_url);
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        const geojsonData = await response.json();
        const L = await import('leaflet');
        const newLayer = L.geoJSON(geojsonData, {
          style: { color: "#ff7800", weight: 3, fillOpacity: 0.1, dashArray: "5, 5" }
        }).addTo(mapInstance.current);
        setBoundaryLayer(newLayer);
        mapInstance.current.fitBounds(newLayer.getBounds());
      } catch (err) { setError('Failed to load claim boundary'); }
    };
    loadBoundary();
  }, [claim, isMapReady, boundaryLayer]);

  useEffect(() => {
    if (claim && claim.geojson_file_url && !analytics && !uploading && !error) {
      processGeoJSONAnalysis();
    }
  }, [claim, analytics, error, uploading]);

  useEffect(() => {
    if (claimId) loadClaimData();
  }, [claimId]);

  const loadClaimData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}`);
      if (response.ok) {
        setClaim((await response.json()).claim);
      } else { setError('Claim not found'); }
    } catch (e) { setError('Error loading claim data'); } 
    finally { setLoading(false); }
  };

  const processGeoJSONAnalysis = async () => {
    if (!claim?.id) return;
    setUploading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/webgis/analyze-claim-auto/${claimId}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data.gee_analysis);
      } else { throw new Error(data.detail || `Analysis failed`); }
    } catch (e) { setError(`Analysis failed: ${e.message}`); } 
    finally { setUploading(false); }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'Forest': return 'bg-green-500'; case 'Agriculture': return 'bg-yellow-500'; case 'Urban & Barren Land': return 'bg-gray-500'; case 'Water & Wetland': return 'bg-blue-500'; case 'Shrub & Grassland': return 'bg-orange-500'; default: return 'bg-purple-500';
    }
  };

  const goBack = () => navigate('/library');

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading WebGIS data...</p></div></div>;
  }
  if (error && !analytics) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><AlertCircle className="mx-auto text-red-500 mb-4" size={48} /><h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2><p className="text-gray-600 mb-4">{error}</p><button onClick={goBack} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Back to Digital Library</button></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={goBack} className="flex items-center text-gray-600 hover:text-green-600"><ArrowLeft size={20} className="mr-2" /> Back to Digital Library</button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center"><Satellite className="mr-3 text-green-600" size={24} /> Atavi Atlas - WebGIS Analysis</h1>
                {claim && <div className="flex items-center space-x-4 mt-1 text-sm"><p className="text-gray-600"><strong>Claim:</strong> FRA-{claim.id.toString().padStart(3, '0')}</p><p className="text-gray-600"><strong>Applicant:</strong> {claim.claimant_name}</p></div>}
              </div>
            </div>
            <div className="text-sm text-gray-500">Powered by Google Earth Engine</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="flex-1 lg:flex-[2] relative bg-white rounded-lg shadow overflow-hidden">
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px', height: '100%' }} />
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2 z-10">
              <button onClick={() => mapInstance.current?.zoomIn()} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600" title="Zoom In"><ZoomIn size={16} /></button>
              <button onClick={() => mapInstance.current?.zoomOut()} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600" title="Zoom Out"><ZoomOut size={16} /></button>
              <button onClick={() => mapInstance.current?.setView([20.9517, 85.0985], 8)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600" title="Reset View"><Home size={16} /></button>
            </div>
            {uploading && <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="mt-4 text-gray-600">Processing satellite analysis...</p></div></div>}
          </div>
          <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><MapPin className="mr-2 text-green-600" size={20} /> Claim Boundary Analysis</h3>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center"><AlertCircle className="text-red-600 mr-2" size={16} /><span className="text-sm text-red-700">{error}</span></div></div>}
              {analytics ? (<div>
                <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-500">
                  <h5 className="font-medium text-green-800 mb-2">Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-green-700">Total Area:</span><span className="font-medium text-green-900">{analytics.total_area_hectares ? `${analytics.total_area_hectares} ha` : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-green-700">Forest Coverage:</span><span className="font-medium text-green-900">{analytics.forest_coverage_percent ? `${analytics.forest_coverage_percent}%` : 'N/A'}</span></div>
                  </div>
                </div>
                {analytics.analytics && Object.keys(analytics.analytics).length > 0 && (<div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Land Classification Breakdown</h5>
                  {Object.entries(analytics.analytics).map(([landType, area]) => {
                    const numericArea = parseFloat(area) || 0;
                    const totalArea = analytics.total_area_hectares || 100;
                    const percentage = totalArea > 0 ? ((numericArea / totalArea) * 100).toFixed(1) : '0';
                    return (<div key={landType} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2"><div className="flex items-center"><div className={`w-4 h-4 rounded-full mr-3 ${getColorClass(landType)}`}></div><span className="font-medium text-gray-900">{landType}</span></div><span className="text-lg font-bold text-gray-900">{percentage}%</span></div>
                      <div className="mb-2"><span className="text-sm text-gray-600">Area: {numericArea.toFixed(2)} ha</span></div>
                      <div className="bg-gray-100 rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ease-out ${getColorClass(landType)}`} style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}></div></div>
                    </div>);
                  })}
                </div>)}
              </div>) : (<div className="text-center py-8 text-gray-500"><p>Analysis results will be displayed here.</p></div>)}
              <button onClick={processGeoJSONAnalysis} disabled={uploading || !claim?.geojson_file_url} className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center">
                {uploading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...</> : <><BarChart3 size={16} className="mr-2" />Refresh Analysis</>}
              </button>
            </div>
          </div>
        </div>
        <SchemeRecommendations recommendations={recommendedSchemes} onSendNotifications={handleSendNotifications} notificationStatus={notificationStatus} />
      </div>
    </div>
  );
};

export default ViewGIS;