import React, { useState, useEffect } from "react";
import { X, MapPin, FileText, Calendar, User, Map, Brain, ExternalLink, Edit, Check, ChevronDown, RefreshCw, AlertCircle, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // ✅ Add this import

const statusOptions = ["Pending", "Under Review", "Approved", "Rejected", "OCR Processed"];

export default function DigitalLibrary() {
  // ✅ Add navigate hook
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  // ✅ Delete functionality states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);
  const [deletingClaim, setDeletingClaim] = useState(null);

  const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

  // ✅ Delete claim function
  const handleDeleteClaim = async (claim, event) => {
    event?.stopPropagation();
    
    if (!isAdmin) {
      alert("❌ Admin privileges required to delete claims");
      return;
    }

    setClaimToDelete(claim);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteClaim = async () => {
    if (!claimToDelete) return;

    setDeletingClaim(claimToDelete.claimId);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/claims/${claimToDelete.backendId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setClaims(prevClaims => 
          prevClaims.filter(c => c.claimId !== claimToDelete.claimId)
        );
        
        // Close popup if the deleted claim was selected
        if (selectedClaim && selectedClaim.claimId === claimToDelete.claimId) {
          setShowPopup(false);
          setSelectedClaim(null);
        }

        alert(`✅ Successfully deleted claim ${claimToDelete.claimId}`);
      } else {
        throw new Error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting claim:", err);
      alert(`❌ Failed to delete claim: ${err.message}`);
    } finally {
      setDeletingClaim(null);
      setShowDeleteConfirm(false);
      setClaimToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClaimToDelete(null);
  };

  // ✅ Fetch claims from Aṭavī Atlas backend
  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/claims?full_details=false`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        // Transform backend data to match frontend structure
        const transformedClaims = data.claims.map(claim => ({
          claimId: `FRA-${claim.id.toString().padStart(3, '0')}`,
          applicantName: claim.claimant_name || "Unknown",
          village: claim.village_name || claim.extracted_fields?.Village || "Unknown",
          district: claim.district || "Unknown",
          state: claim.state || "Odisha",
          claimType: getClaimTypeDisplay(claim.form_subtype),
          area: extractArea(claim.extracted_fields) || "N/A",
          submissionDate: formatDate(claim.submission_date),
          status: mapStatus(claim.status),
          description: claim.comments || `${claim.form_type} claim processed via Atlas OCR`,
          coordinates: getCoordinates(claim),
          contactNumber: "Contact via Forest Department",
          documentCount: claim.document_filename ? 1 : 0,
          reviewedBy: claim.assigned_officer || "Pending Assignment",
          reviewDate: claim.submission_date ? formatDate(claim.submission_date) : "N/A",
          remarks: claim.verification_notes || "Processed through Aṭavī Atlas system",
          // Backend specific fields
          backendId: claim.id,
          extracted_fields: claim.extracted_fields,
          document_filename: claim.document_filename,
          priority: claim.priority
        }));
        
        setClaims(transformedClaims);
      } else {
        throw new Error("Failed to fetch claims");
      }
    } catch (err) {
      setError(`Failed to load claims: ${err.message}`);
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Transform backend data helpers
  const getClaimTypeDisplay = (formSubtype) => {
    const typeMap = {
      'IFR': 'Individual Forest Rights',
      'CR': 'Community Rights',
      'CFR': 'Community Forest Rights',
      'Granted Title': 'Legacy Rights'
    };
    return typeMap[formSubtype] || formSubtype || 'Individual';
  };

  const extractArea = (extractedFields) => {
    if (!extractedFields) return null;
    
    const habitation = extractedFields.HabitationArea;
    const cultivation = extractedFields.CultivationArea;
    
    if (habitation || cultivation) {
      const hab = parseFloat(habitation?.replace(' ha', '') || 0);
      const cult = parseFloat(cultivation?.replace(' ha', '') || 0);
      const total = hab + cult;
      return total > 0 ? total.toFixed(2) : null;
    }
    
    return null;
  };

  const getCoordinates = (claim) => {
    if (claim.latitude && claim.longitude) {
      return `${claim.latitude}° N, ${claim.longitude}° E`;
    }
    
    // Default coordinates for districts
    const districtCoords = {
      'Mayurbhanj': '22.1467° N, 86.7425° E',
      'Khurda': '20.1811° N, 85.6107° E',
      'Cuttack': '20.4625° N, 85.8828° E'
    };
    
    return districtCoords[claim.district?.replace(', Odisha', '')] || '20.9517° N, 85.0985° E';
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      'Pending': 'pending',
      'OCR Processed': 'under review',
      'Under Review': 'under review',
      'Approved': 'approved',
      'Rejected': 'rejected'
    };
    return statusMap[backendStatus] || 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // ✅ Update claim status in backend
  const handleStatusChange = async (claimId, newStatus) => {
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim) return;

    setUpdatingStatus(claimId);
    
    try {
      // Map frontend status to backend status
      const backendStatusMap = {
        'pending': 'Pending',
        'under review': 'Under Review', 
        'approved': 'Approved',
        'rejected': 'Rejected'
      };
      
      const backendStatus = backendStatusMap[newStatus];
      const notes = `Status updated to ${backendStatus} via Digital Library`;
      
      const response = await fetch(
        `${API_BASE_URL}/claims/${claim.backendId}/status?status=${encodeURIComponent(backendStatus)}&notes=${encodeURIComponent(notes)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const currentDate = new Date().toLocaleDateString('en-GB');
        setClaims(prevClaims => 
          prevClaims.map(c => 
            c.claimId === claimId 
              ? { 
                  ...c, 
                  status: newStatus,
                  reviewDate: currentDate,
                  reviewedBy: "Digital Library Admin",
                  remarks: `Status updated to ${backendStatus} on ${currentDate}`
                }
              : c
          )
        );
        
        // Update selected claim if open
        if (selectedClaim && selectedClaim.claimId === claimId) {
          setSelectedClaim(prev => ({
            ...prev,
            status: newStatus,
            reviewDate: currentDate,
            reviewedBy: "Digital Library Admin",
            remarks: `Status updated to ${backendStatus} on ${currentDate}`
          }));
        }
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
      setShowStatusDropdown(null);
    }
  };

  // ✅ Search claims using backend
  const searchClaims = async (query) => {
    if (!query.trim()) {
      fetchClaims();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/claims/search?q=${encodeURIComponent(query)}&full_details=false`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        const transformedClaims = data.claims.map(claim => ({
          claimId: `FRA-${claim.id.toString().padStart(3, '0')}`,
          applicantName: claim.claimant_name || "Unknown",
          village: claim.village_name || claim.extracted_fields?.Village || "Unknown", 
          district: claim.district || "Unknown",
          state: claim.state || "Odisha",
          claimType: getClaimTypeDisplay(claim.form_subtype),
          area: extractArea(claim.extracted_fields) || "N/A",
          submissionDate: formatDate(claim.submission_date),
          status: mapStatus(claim.status),
          description: claim.comments || `${claim.form_type} claim processed via Atlas OCR`,
          coordinates: getCoordinates(claim),
          contactNumber: "Contact via Forest Department",
          documentCount: claim.document_filename ? 1 : 0,
          reviewedBy: claim.assigned_officer || "Pending Assignment",
          reviewDate: claim.submission_date ? formatDate(claim.submission_date) : "N/A",
          remarks: claim.verification_notes || "Processed through Aṭavī Atlas system",
          backendId: claim.id,
          extracted_fields: claim.extracted_fields,
          document_filename: claim.document_filename,
          priority: claim.priority
        }));
        
        setClaims(transformedClaims);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  // ✅ Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 2) {
        searchClaims(search);
      } else if (search.length === 0) {
        fetchClaims();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Get unique districts from claims
  const districts = ["all", ...Array.from(new Set(claims.map((c) => c.district)))];

  const filteredClaims = claims.filter((c) => {
    return (
      (statusFilter === "all" || c.status === statusFilter) &&
      (districtFilter === "all" || c.district === districtFilter)
    );
  });

  const handleClaimClick = (claim, event) => {
    if (event.target.closest('.status-dropdown') || event.target.closest('.delete-button')) {
      return;
    }
    setSelectedClaim(claim);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedClaim(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100 hover:bg-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-100 hover:bg-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-100 hover:bg-red-200";
      case "under review":
        return "text-blue-600 bg-blue-100 hover:bg-blue-200";
      default:
        return "text-gray-600 bg-gray-100 hover:bg-gray-200";
    }
  };

  // ✅ Updated WebGIS handler with navigation
  const handleWebGISClick = (claim) => {
    console.log(`🗺️ Opening WebGIS for claim ${claim.claimId}`);
    
    // Navigate to ViewGIS page with claim ID
    navigate(`/viewgis/${claim.backendId}`);
  };

  const handleDSSClick = (claim) => {
    if (claim.document_filename) {
      console.log(`Opening documents for claim ${claim.claimId}: ${claim.document_filename}`);
      alert(`📄 Original Documents\n\nClaim: ${claim.claimId}\nDocument: ${claim.document_filename}\n\nProcessed via Aṭavī Atlas OCR\n\nThis will open the document viewer.`);
    } else {
      alert(`No documents available for claim ${claim.claimId}`);
    }
  };

  const StatusDropdown = ({ claim, isInPopup = false }) => {
    const isOpen = showStatusDropdown === claim.claimId;
    const isUpdating = updatingStatus === claim.claimId;
    
    return (
      <div className="status-dropdown relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(isOpen ? null : claim.claimId);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${getStatusColor(claim.status)} ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${isUpdating ? 'opacity-50' : ''}`}
          disabled={!isAdmin || isUpdating}
        >
          <span>{claim.status}</span>
          {isAdmin && (isUpdating ? <RefreshCw size={12} className="animate-spin" /> : <ChevronDown size={12} />)}
        </button>
        
        {isAdmin && isOpen && !isUpdating && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
            {statusOptions.map((status) => {
              const mappedStatus = mapStatus(status);
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(claim.claimId, mappedStatus);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    claim.status === mappedStatus ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    mappedStatus === 'approved' ? 'bg-green-500' :
                    mappedStatus === 'pending' ? 'bg-yellow-500' :
                    mappedStatus === 'rejected' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></span>
                  {status}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ✅ Delete Button Component
  const DeleteButton = ({ claim }) => {
    const isDeleting = deletingClaim === claim.claimId;
    
    if (!isAdmin) return null;
    
    return (
      <button
        onClick={(e) => handleDeleteClaim(claim, e)}
        disabled={isDeleting}
        className={`delete-button p-1 rounded-full transition-colors ${
          isDeleting 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'hover:bg-red-100 text-red-600 hover:text-red-800'
        }`}
        title="Delete claim"
      >
        {isDeleting ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    );
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <RefreshCw className="animate-spin text-green-600" size={24} />
              <span className="text-lg text-gray-600">Loading claims from Aṭavī Atlas...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchClaims}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Blur overlay when popup is open */}
      {showPopup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 z-40"></div>
      )}
      
      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && claimToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={cancelDelete}></div>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full z-50">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Claim</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-800">
                  Are you sure you want to delete claim <strong>{claimToDelete.claimId}</strong> for <strong>{claimToDelete.applicantName}</strong>?
                </p>
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This will permanently remove the claim record and all associated data from the system.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClaim}
                  disabled={deletingClaim}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {deletingClaim ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Delete Claim</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Centered container with max width */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🌳 Aṭavī Atlas - Digital Library
              </h1>
              <p className="text-gray-600">
                Forest Rights Act claims powered by AI-driven OCR processing
              </p>
            </div>
            {/* Connection status & Admin toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected to Atlas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Admin Mode:</span>
                <button
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    isAdmin ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      isAdmin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAdmin ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAdmin ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Filter & Search Records
            </h2>
            <button
              onClick={fetchClaims}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or claim ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All Districts" : d}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDistrictFilter("all");
                fetchClaims();
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Claim ID</th>
                  <th className="py-3 px-4 text-left">Applicant Name</th>
                  <th className="py-3 px-4 text-left">Village</th>
                  <th className="py-3 px-4 text-left">District</th>
                  <th className="py-3 px-4 text-left">Claim Type</th>
                  <th className="py-3 px-4 text-left">Area (ha)</th>
                  <th className="py-3 px-4 text-left">Submission Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.claimId}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => handleClaimClick(claim, e)}
                  >
                    <td className="py-3 px-4 font-medium text-blue-600 hover:text-blue-800">
                      {claim.claimId}
                    </td>
                    <td className="py-3 px-4">{claim.applicantName}</td>
                    <td className="py-3 px-4">{claim.village}</td>
                    <td className="py-3 px-4">{claim.district}</td>
                    <td className="py-3 px-4">{claim.claimType}</td>
                    <td className="py-3 px-4">{claim.area}</td>
                    <td className="py-3 px-4">{claim.submissionDate}</td>
                    <td className="py-3 px-4">
                      <StatusDropdown claim={claim} />
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <DeleteButton claim={claim} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClaims.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              No claims found matching your filters.
            </p>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <span>Showing {filteredClaims.length} of {claims.length} claims</span>
          <span className="text-green-600">🌳 Powered by Aṭavī Atlas</span>
        </div>
      </div>

      {/* Claim Details Popup - Enhanced with navigation */}
      {showPopup && selectedClaim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b bg-green-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Claim Details
                </h2>
                <p className="text-green-600 font-medium">{selectedClaim.claimId}</p>
                <p className="text-sm text-gray-600">Processed via Aṭavī Atlas OCR</p>
              </div>
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteClaim(selectedClaim, e)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete claim"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  onClick={closePopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <StatusDropdown claim={selectedClaim} isInPopup={true} />
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Applicant Name</p>
                      <p className="text-gray-900">{selectedClaim.applicantName}</p>
                      {selectedClaim.extracted_fields?.Spouse && (
                        <p className="text-sm text-gray-600">Spouse: {selectedClaim.extracted_fields.Spouse}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Location</p>
                      <p className="text-gray-900">
                        {selectedClaim.village}, {selectedClaim.district}
                      </p>
                      <p className="text-sm text-gray-600">{selectedClaim.coordinates}</p>
                      {selectedClaim.extracted_fields?.GramPanchayat && (
                        <p className="text-sm text-gray-600">GP: {selectedClaim.extracted_fields.GramPanchayat}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileText className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Claim Type</p>
                      <p className="text-gray-900">{selectedClaim.claimType}</p>
                      <p className="text-sm text-gray-600">Form: {selectedClaim.extracted_fields?.FormHeading || "Atlas Processed"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Land Details</p>
                      <p className="text-gray-900">Total Area: {selectedClaim.area} ha</p>
                      {selectedClaim.extracted_fields?.HabitationArea && (
                        <p className="text-sm text-gray-600">Habitation: {selectedClaim.extracted_fields.HabitationArea}</p>
                      )}
                      {selectedClaim.extracted_fields?.CultivationArea && (
                        <p className="text-sm text-gray-600">Cultivation: {selectedClaim.extracted_fields.CultivationArea}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-700">Submission Date</p>
                    <p className="text-gray-900">{selectedClaim.submissionDate}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Document</p>
                    <p className="text-gray-900">{selectedClaim.document_filename || "N/A"}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Priority</p>
                    <p className="text-gray-900">{selectedClaim.priority || "Medium"}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Reviewed By</p>
                    <p className="text-gray-900">{selectedClaim.reviewedBy}</p>
                  </div>

                  {selectedClaim.extracted_fields?.Evidence && (
                    <div>
                      <p className="font-semibold text-gray-700">Evidence</p>
                      <p className="text-gray-900">{selectedClaim.extracted_fields.Evidence}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedClaim.description}
                </p>
              </div>

              {/* Remarks */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Review Remarks</h3>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedClaim.remarks}
                </p>
              </div>

              {/* Action Buttons - Updated with navigation */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleWebGISClick(selectedClaim)}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Map size={20} />
                  <span>View in WebGIS</span>
                  <ExternalLink size={16} />
                </button>

                <button
                  onClick={() => handleDSSClick(selectedClaim)}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Brain size={20} />
                  <span>View Documents</span>
                  <ExternalLink size={16} />
                </button>

                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteClaim(selectedClaim, e)}
                    className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                    <span>Delete Claim</span>
                  </button>
                )}

                <button
                  onClick={closePopup}
                  className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
