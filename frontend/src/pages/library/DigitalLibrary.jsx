import React, { useState } from "react";
import { X, MapPin, FileText, Calendar, User, Map, Brain, ExternalLink, Edit, Check, ChevronDown } from "lucide-react";

// Placeholder for your sample data
const initialSampleData = [
  // Jharkhand
  { claimId: "FRA-2024-001", applicantName: "Ramesh Kumar", village: "Barka", district: "Ranchi", state: "Jharkhand", claimType: "Individual", area: "2.5", submissionDate: "15/1/2024", status: "approved", description: "Forest land cultivation rights", coordinates: "23.3441° N, 85.3096° E", contactNumber: "+91-9876543210", documentCount: 5, reviewedBy: "Forest Officer Ranchi", reviewDate: "28/1/2024", remarks: "All documents verified and found in order" },
  { claimId: "FRA-2024-002", applicantName: "Sita Devi", village: "Chotanagpur", district: "Ranchi", state: "Jharkhand", claimType: "Community", area: "15", submissionDate: "18/1/2024", status: "pending", description: "Community forest rights", coordinates: "23.2599° N, 85.3085° E", contactNumber: "+91-9876543211", documentCount: 8, reviewedBy: "Pending Assignment", reviewDate: "N/A", remarks: "Awaiting community verification meeting" },
  { claimId: "FRA-2024-003", applicantName: "Ajay Singh", village: "Kundru", district: "Hazaribagh", state: "Jharkhand", claimType: "Individual", area: "3.0", submissionDate: "20/1/2024", status: "under review", description: "Individual forest dwelling rights", coordinates: "23.9929° N, 85.3644° E", contactNumber: "+91-9876543212", documentCount: 6, reviewedBy: "Dr. Priya Sharma", reviewDate: "5/2/2024", remarks: "Boundary verification in progress" },
  { claimId: "FRA-2024-004", applicantName: "Anita Kumari", village: "Barkagaon", district: "Hazaribagh", state: "Jharkhand", claimType: "Individual", area: "1.8", submissionDate: "22/1/2024", status: "rejected", description: "Claim rejected due to insufficient proof", coordinates: "23.9829° N, 85.3544° E", contactNumber: "+91-9876543213", documentCount: 3, reviewedBy: "Forest Officer Hazaribagh", reviewDate: "15/2/2024", remarks: "Insufficient documentation of traditional occupation" },
  { claimId: "FRA-2024-005", applicantName: "Tribal Council Ranchi", village: "Ratu", district: "Ranchi", state: "Jharkhand", claimType: "Habitat Rights", area: "45", submissionDate: "25/1/2024", status: "approved", description: "Habitat rights for tribal settlement", coordinates: "23.3541° N, 85.2996° E", contactNumber: "+91-9876543214", documentCount: 12, reviewedBy: "Joint Forest Management Committee", reviewDate: "20/2/2024", remarks: "Comprehensive habitat conservation plan approved" },
  { claimId: "FRA-2024-006", applicantName: "Sunil Yadav", village: "Koderma", district: "Koderma", state: "Jharkhand", claimType: "Individual", area: "2.7", submissionDate: "28/1/2024", status: "pending", description: "Forest land claim for agriculture", coordinates: "24.4669° N, 85.5947° E", contactNumber: "+91-9876543215", documentCount: 4, reviewedBy: "Pending Assignment", reviewDate: "N/A", remarks: "Scheduled for field verification" },
  { claimId: "FRA-2024-007", applicantName: "Rita Devi", village: "Chandwa", district: "Latehar", state: "Jharkhand", claimType: "Community", area: "20", submissionDate: "1/2/2024", status: "approved", description: "Community forest resources for grazing", coordinates: "23.7446° N, 84.1289° E", contactNumber: "+91-9876543216", documentCount: 9, reviewedBy: "Community Forest Rights Committee", reviewDate: "25/2/2024", remarks: "Sustainable grazing plan implemented" },
  { claimId: "FRA-2024-008", applicantName: "Manoj Singh", village: "Palamu", district: "Palamu", state: "Jharkhand", claimType: "Individual", area: "3.3", submissionDate: "3/2/2024", status: "under review", description: "Individual land for traditional farming", coordinates: "24.0333° N, 84.0667° E", contactNumber: "+91-9876543217", documentCount: 7, reviewedBy: "Agricultural Extension Officer", reviewDate: "10/2/2024", remarks: "Traditional farming practices being evaluated" },
  { claimId: "FRA-2024-009", applicantName: "Sunita Kumari", village: "Garhwa", district: "Garhwa", state: "Jharkhand", claimType: "Individual", area: "2.0", submissionDate: "5/2/2024", status: "rejected", description: "Boundary dispute", coordinates: "24.1667° N, 83.8000° E", contactNumber: "+91-9876543218", documentCount: 2, reviewedBy: "Revenue Officer", reviewDate: "20/2/2024", remarks: "Boundary conflict with neighboring claimant" },
  { claimId: "FRA-2024-010", applicantName: "Tribal Council Hazaribagh", village: "Barkagaon", district: "Hazaribagh", state: "Jharkhand", claimType: "Habitat Rights", area: "50", submissionDate: "7/2/2024", status: "approved", description: "Protection of local tribal settlement", coordinates: "23.9829° N, 85.3544° E", contactNumber: "+91-9876543219", documentCount: 15, reviewedBy: "State Forest Committee", reviewDate: "5/3/2024", remarks: "Model tribal settlement conservation project" }
];

const statusOptions = ["pending", "approved", "under review", "rejected"];

export default function DigitalLibrary() {
  const [claims, setClaims] = useState(initialSampleData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Toggle this for admin mode
  const [editingStatus, setEditingStatus] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);

  const states = ["all", ...Array.from(new Set(claims.map((c) => c.state)))];

  const districts =
    stateFilter === "all"
      ? ["all", ...Array.from(new Set(claims.map((c) => c.district)))]
      : [
          "all",
          ...Array.from(
            new Set(
              claims
                .filter((c) => c.state === stateFilter)
                .map((c) => c.district)
            )
          ),
        ];

  const filteredClaims = claims.filter((c) => {
    return (
      (statusFilter === "all" || c.status === statusFilter) &&
      (stateFilter === "all" || c.state === stateFilter) &&
      (districtFilter === "all" || c.district === districtFilter) &&
      (c.claimId.toLowerCase().includes(search.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleClaimClick = (claim, event) => {
    // Prevent popup from opening when clicking on status dropdown
    if (event.target.closest('.status-dropdown')) {
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

  const handleStatusChange = (claimId, newStatus) => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.claimId === claimId 
          ? { 
              ...claim, 
              status: newStatus,
              reviewDate: currentDate,
              reviewedBy: "Admin User",
              remarks: `Status updated to ${newStatus} on ${currentDate}`
            }
          : claim
      )
    );
    
    // Update selected claim if it's currently open
    if (selectedClaim && selectedClaim.claimId === claimId) {
      setSelectedClaim(prev => ({
        ...prev,
        status: newStatus,
        reviewDate: currentDate,
        reviewedBy: "Admin User",
        remarks: `Status updated to ${newStatus} on ${currentDate}`
      }));
    }
    
    setShowStatusDropdown(null);
  };

  const handleWebGISClick = (claim) => {
    console.log(`Opening WebGIS for claim ${claim.claimId} at coordinates: ${claim.coordinates}`);
    alert(`Opening WebGIS for ${claim.claimId} at ${claim.coordinates}`);
  };

  const handleDSSClick = (claim) => {
    console.log(`Opening Original Documents for claim ${claim.claimId}`);
    alert(`Opening Original Documents for ${claim.claimId}`);
  };

  const StatusDropdown = ({ claim, isInPopup = false }) => {
    const isOpen = showStatusDropdown === claim.claimId;
    
    return (
      <div className="status-dropdown relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(isOpen ? null : claim.claimId);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${getStatusColor(claim.status)} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!isAdmin}
        >
          <span>{claim.status}</span>
          {isAdmin && <ChevronDown size={12} />}
        </button>
        
        {isAdmin && isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(claim.claimId, status);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  claim.status === status ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  status === 'approved' ? 'bg-green-500' :
                  status === 'pending' ? 'bg-yellow-500' :
                  status === 'rejected' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></span>
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Blur overlay when popup is open */}
      {showPopup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 z-40"></div>
      )}
      
      {/* Centered container with max width */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Forest Rights Act - Digital Library
              </h1>
              <p className="text-gray-600">
                Comprehensive database of FRA claims and applications
              </p>
            </div>
            {/* Admin mode toggle */}
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filter & Search Records
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by Claim ID or Applicant"
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
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter("all");
              }}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All States" : s}
                </option>
              ))}
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
                setStateFilter("all");
                setDistrictFilter("all");
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
                  <th className="py-3 px-4 text-left">Claim Id</th>
                  <th className="py-3 px-4 text-left">Applicant Name</th>
                  <th className="py-3 px-4 text-left">Village</th>
                  <th className="py-3 px-4 text-left">District</th>
                  <th className="py-3 px-4 text-left">State</th>
                  <th className="py-3 px-4 text-left">Claim Type</th>
                  <th className="py-3 px-4 text-left">Area (acres)</th>
                  <th className="py-3 px-4 text-left">Submission Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
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
                    <td className="py-3 px-4">{claim.state}</td>
                    <td className="py-3 px-4">{claim.claimType}</td>
                    <td className="py-3 px-4">{claim.area}</td>
                    <td className="py-3 px-4">{claim.submissionDate}</td>
                    <td className="py-3 px-4">
                      <StatusDropdown claim={claim} />
                    </td>
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
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredClaims.length} of {claims.length} claims
        </div>
      </div>

      {/* Claim Details Popup */}
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
              </div>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
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
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Location</p>
                      <p className="text-gray-900">
                        {selectedClaim.village}, {selectedClaim.district}, {selectedClaim.state}
                      </p>
                      <p className="text-sm text-gray-600">{selectedClaim.coordinates}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileText className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Claim Type</p>
                      <p className="text-gray-900">{selectedClaim.claimType}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Area Claimed</p>
                      <p className="text-gray-900">{selectedClaim.area} acres</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-700">Contact Number</p>
                    <p className="text-gray-900">{selectedClaim.contactNumber}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Submission Date</p>
                    <p className="text-gray-900">{selectedClaim.submissionDate}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Documents Submitted</p>
                    <p className="text-gray-900">{selectedClaim.documentCount} documents</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Reviewed By</p>
                    <p className="text-gray-900">{selectedClaim.reviewedBy}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Review Date</p>
                    <p className="text-gray-900">{selectedClaim.reviewDate}</p>
                  </div>
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

              {/* Action Buttons */}
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
                  <span>Original Documents</span>
                  <ExternalLink size={16} />
                </button>

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