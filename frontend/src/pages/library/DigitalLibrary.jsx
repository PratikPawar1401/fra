import React, { useState } from "react";

// Placeholder for your sample data
const sampleData = [
  // Jharkhand
  { claimId: "FRA-2024-001", applicantName: "Ramesh Kumar", village: "Barka", district: "Ranchi", state: "Jharkhand", claimType: "Individual", area: "2.5", submissionDate: "15/1/2024", status: "approved", description: "Forest land cultivation rights" },
  { claimId: "FRA-2024-002", applicantName: "Sita Devi", village: "Chotanagpur", district: "Ranchi", state: "Jharkhand", claimType: "Community", area: "15", submissionDate: "18/1/2024", status: "pending", description: "Community forest rights" },
  { claimId: "FRA-2024-003", applicantName: "Ajay Singh", village: "Kundru", district: "Hazaribagh", state: "Jharkhand", claimType: "Individual", area: "3.0", submissionDate: "20/1/2024", status: "under review", description: "Individual forest dwelling rights" },
  { claimId: "FRA-2024-004", applicantName: "Anita Kumari", village: "Barkagaon", district: "Hazaribagh", state: "Jharkhand", claimType: "Individual", area: "1.8", submissionDate: "22/1/2024", status: "rejected", description: "Claim rejected due to insufficient proof" },
  { claimId: "FRA-2024-005", applicantName: "Tribal Council Ranchi", village: "Ratu", district: "Ranchi", state: "Jharkhand", claimType: "Habitat Rights", area: "45", submissionDate: "25/1/2024", status: "approved", description: "Habitat rights for tribal settlement" },
  { claimId: "FRA-2024-006", applicantName: "Sunil Yadav", village: "Koderma", district: "Koderma", state: "Jharkhand", claimType: "Individual", area: "2.7", submissionDate: "28/1/2024", status: "pending", description: "Forest land claim for agriculture" },
  { claimId: "FRA-2024-007", applicantName: "Rita Devi", village: "Chandwa", district: "Latehar", state: "Jharkhand", claimType: "Community", area: "20", submissionDate: "1/2/2024", status: "approved", description: "Community forest resources for grazing" },
  { claimId: "FRA-2024-008", applicantName: "Manoj Singh", village: "Palamu", district: "Palamu", state: "Jharkhand", claimType: "Individual", area: "3.3", submissionDate: "3/2/2024", status: "under review", description: "Individual land for traditional farming" },
  { claimId: "FRA-2024-009", applicantName: "Sunita Kumari", village: "Garhwa", district: "Garhwa", state: "Jharkhand", claimType: "Individual", area: "2.0", submissionDate: "5/2/2024", status: "rejected", description: "Boundary dispute" },
  { claimId: "FRA-2024-010", applicantName: "Tribal Council Hazaribagh", village: "Barkagaon", district: "Hazaribagh", state: "Jharkhand", claimType: "Habitat Rights", area: "50", submissionDate: "7/2/2024", status: "approved", description: "Protection of local tribal settlement" },

  // Odisha
  { claimId: "FRA-2024-011", applicantName: "Rakesh Pradhan", village: "Bhubaneswar", district: "Khordha", state: "Odisha", claimType: "Individual", area: "3.5", submissionDate: "10/2/2024", status: "approved", description: "Forest land cultivation" },
  { claimId: "FRA-2024-012", applicantName: "Sunita Patra", village: "Puri", district: "Puri", state: "Odisha", claimType: "Community", area: "12", submissionDate: "12/2/2024", status: "pending", description: "Community forest rights for tribal settlement" },
  { claimId: "FRA-2024-013", applicantName: "Ajay Das", village: "Cuttack", district: "Cuttack", state: "Odisha", claimType: "Individual", area: "2.8", submissionDate: "15/2/2024", status: "under review", description: "Individual forest dwelling rights" },
  { claimId: "FRA-2024-014", applicantName: "Anjali Sahoo", village: "Bolangir", district: "Bolangir", state: "Odisha", claimType: "Individual", area: "2.0", submissionDate: "18/2/2024", status: "rejected", description: "Insufficient proof" },
  { claimId: "FRA-2024-015", applicantName: "Tribal Council Koraput", village: "Koraput", district: "Koraput", state: "Odisha", claimType: "Habitat Rights", area: "60", submissionDate: "20/2/2024", status: "approved", description: "Tribal habitat rights" },
  { claimId: "FRA-2024-016", applicantName: "Raju Behera", village: "Rayagada", district: "Rayagada", state: "Odisha", claimType: "Individual", area: "3.2", submissionDate: "22/2/2024", status: "pending", description: "Forest land claim" },
  { claimId: "FRA-2024-017", applicantName: "Sunil Pradhan", village: "Malkangiri", district: "Malkangiri", state: "Odisha", claimType: "Community", area: "18", submissionDate: "25/2/2024", status: "approved", description: "Community forest grazing land" },
  { claimId: "FRA-2024-018", applicantName: "Priya Sahu", village: "Kalahandi", district: "Kalahandi", state: "Odisha", claimType: "Individual", area: "2.5", submissionDate: "28/2/2024", status: "under review", description: "Medicinal plant cultivation" },
  { claimId: "FRA-2024-019", applicantName: "Tribal Council Rayagada", village: "Rayagada", district: "Rayagada", state: "Odisha", claimType: "Habitat Rights", area: "55", submissionDate: "1/3/2024", status: "approved", description: "Community habitat conservation" },
  { claimId: "FRA-2024-020", applicantName: "Rakhi Patra", village: "Balangir", district: "Bolangir", state: "Odisha", claimType: "Individual", area: "2.2", submissionDate: "3/3/2024", status: "rejected", description: "Boundary issues" },

  // Meghalaya
  { claimId: "FRA-2024-021", applicantName: "Vijay Kharkongor", village: "Shillong", district: "East Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "3.3", submissionDate: "5/3/2024", status: "approved", description: "Forest land claim for farming" },
  { claimId: "FRA-2024-022", applicantName: "Seema Lyngdoh", village: "Mawphlang", district: "East Khasi Hills", state: "Meghalaya", claimType: "Community", area: "14", submissionDate: "7/3/2024", status: "pending", description: "Community forest resource rights" },
  { claimId: "FRA-2024-023", applicantName: "Rahul Khongjee", village: "Nongstoin", district: "West Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "2.9", submissionDate: "10/3/2024", status: "under review", description: "Traditional forest dwelling rights" },
  { claimId: "FRA-2024-024", applicantName: "Anita Shullai", village: "Tura", district: "West Garo Hills", state: "Meghalaya", claimType: "Individual", area: "1.7", submissionDate: "12/3/2024", status: "rejected", description: "Insufficient documentation" },
  { claimId: "FRA-2024-025", applicantName: "Tribal Council Shillong", village: "Shillong", district: "East Khasi Hills", state: "Meghalaya", claimType: "Habitat Rights", area: "48", submissionDate: "15/3/2024", status: "approved", description: "Habitat rights for tribal community" },
  { claimId: "FRA-2024-026", applicantName: "Manoj Kharkongor", village: "Mawryngkneng", district: "East Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "3.1", submissionDate: "18/3/2024", status: "pending", description: "Forest land for agriculture" },
  { claimId: "FRA-2024-027", applicantName: "Pooja R. Lyngdoh", village: "Nongkseh", district: "Ri Bhoi", state: "Meghalaya", claimType: "Community", area: "20", submissionDate: "20/3/2024", status: "approved", description: "Community grazing land" },
  { claimId: "FRA-2024-028", applicantName: "Rohit S. Kharkongor", village: "Tura", district: "West Garo Hills", state: "Meghalaya", claimType: "Individual", area: "2.4", submissionDate: "22/3/2024", status: "under review", description: "Medicinal plant cultivation" },
  { claimId: "FRA-2024-029", applicantName: "Sunita Shullai", village: "Shillong", district: "East Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "1.9", submissionDate: "25/3/2024", status: "rejected", description: "Claim rejected due to overlapping land" },
  { claimId: "FRA-2024-030", applicantName: "Tribal Council Tura", village: "Tura", district: "West Garo Hills", state: "Meghalaya", claimType: "Habitat Rights", area: "55", submissionDate: "28/3/2024", status: "approved", description: "Protection of tribal settlement" },

  // Repeat similar pattern for 20 more records across these states to make 50
  { claimId: "FRA-2024-031", applicantName: "Rakesh Kumar", village: "Barka", district: "Ranchi", state: "Jharkhand", claimType: "Individual", area: "2.6", submissionDate: "30/3/2024", status: "approved", description: "Agriculture land" },
  { claimId: "FRA-2024-032", applicantName: "Sita Devi", village: "Deulgaon", district: "Khordha", state: "Odisha", claimType: "Community", area: "16", submissionDate: "1/4/2024", status: "pending", description: "Community forest resources" },
  { claimId: "FRA-2024-033", applicantName: "Ajay Singh", village: "Patharwada", district: "Hazaribagh", state: "Jharkhand", claimType: "Individual", area: "3.4", submissionDate: "3/4/2024", status: "under review", description: "Traditional farming rights" },
  { claimId: "FRA-2024-034", applicantName: "Anita Kumari", village: "Barkagaon", district: "West Singhbhum", state: "Jharkhand", claimType: "Individual", area: "1.9", submissionDate: "5/4/2024", status: "rejected", description: "Insufficient proof" },
  { claimId: "FRA-2024-035", applicantName: "Tribal Council Ranchi", village: "Ratu", district: "Ranchi", state: "Jharkhand", claimType: "Habitat Rights", area: "46", submissionDate: "7/4/2024", status: "approved", description: "Tribal settlement protection" },
  { claimId: "FRA-2024-036", applicantName: "Vijay Kharkongor", village: "Shillong", district: "East Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "3.2", submissionDate: "9/4/2024", status: "approved", description: "Forest land claim" },
  { claimId: "FRA-2024-037", applicantName: "Seema Lyngdoh", village: "Mawphlang", district: "East Khasi Hills", state: "Meghalaya", claimType: "Community", area: "13", submissionDate: "11/4/2024", status: "pending", description: "Community forest resources" },
  { claimId: "FRA-2024-038", applicantName: "Rakesh Pradhan", village: "Bhubaneswar", district: "Khordha", state: "Odisha", claimType: "Individual", area: "3.6", submissionDate: "13/4/2024", status: "approved", description: "Forest land cultivation" },
  { claimId: "FRA-2024-039", applicantName: "Sunita Patra", village: "Puri", district: "Puri", state: "Odisha", claimType: "Community", area: "12", submissionDate: "15/4/2024", status: "pending", description: "Community forest rights" },
  { claimId: "FRA-2024-040", applicantName: "Ajay Das", village: "Cuttack", district: "Cuttack", state: "Odisha", claimType: "Individual", area: "3.0", submissionDate: "17/4/2024", status: "under review", description: "Forest dwelling rights" },
  { claimId: "FRA-2024-041", applicantName: "Anjali Sahoo", village: "Bolangir", district: "Bolangir", state: "Odisha", claimType: "Individual", area: "2.1", submissionDate: "19/4/2024", status: "rejected", description: "Insufficient proof" },
  { claimId: "FRA-2024-042", applicantName: "Tribal Council Koraput", village: "Koraput", district: "Koraput", state: "Odisha", claimType: "Habitat Rights", area: "61", submissionDate: "21/4/2024", status: "approved", description: "Tribal habitat rights" },
  { claimId: "FRA-2024-043", applicantName: "Raju Behera", village: "Rayagada", district: "Rayagada", state: "Odisha", claimType: "Individual", area: "3.3", submissionDate: "23/4/2024", status: "pending", description: "Forest land claim" },
  { claimId: "FRA-2024-044", applicantName: "Sunil Pradhan", village: "Malkangiri", district: "Malkangiri", state: "Odisha", claimType: "Community", area: "19", submissionDate: "25/4/2024", status: "approved", description: "Community grazing land" },
  { claimId: "FRA-2024-045", applicantName: "Priya Sahu", village: "Kalahandi", district: "Kalahandi", state: "Odisha", claimType: "Individual", area: "2.6", submissionDate: "27/4/2024", status: "under review", description: "Medicinal plant cultivation" },
  { claimId: "FRA-2024-046", applicantName: "Tribal Council Rayagada", village: "Rayagada", district: "Rayagada", state: "Odisha", claimType: "Habitat Rights", area: "56", submissionDate: "29/4/2024", status: "approved", description: "Community habitat conservation" },
  { claimId: "FRA-2024-047", applicantName: "Rakhi Patra", village: "Balangir", district: "Bolangir", state: "Odisha", claimType: "Individual", area: "2.3", submissionDate: "1/5/2024", status: "rejected", description: "Boundary issues" },
  { claimId: "FRA-2024-048", applicantName: "Manoj Kharkongor", village: "Mawryngkneng", district: "East Khasi Hills", state: "Meghalaya", claimType: "Individual", area: "3.0", submissionDate: "3/5/2024", status: "pending", description: "Forest land for agriculture" },
  { claimId: "FRA-2024-049", applicantName: "Pooja Lyngdoh", village: "Nongkseh", district: "Ri Bhoi", state: "Meghalaya",}
];

export default function DigitalLibrary() {
  const [claims] = useState(sampleData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");

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

  return (
    <div className="p-6">
      {/* Centered container with max width */}
      <div className="max-w-7xl mx-auto">

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
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
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
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
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
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
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
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Claim Id</th>
                <th className="py-3 px-4 text-left">Applicant Name</th>
                <th className="py-3 px-4 text-left">Village</th>
                <th className="py-3 px-4 text-left">District</th>
                <th className="py-3 px-4 text-left">State</th>
                <th className="py-3 px-4 text-left">Claim Type</th>
                <th className="py-3 px-4 text-left">Area</th>
                <th className="py-3 px-4 text-left">Submission Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.claimId}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-2 px-4">{claim.claimId}</td>
                  <td className="py-2 px-4">{claim.applicantName}</td>
                  <td className="py-2 px-4">{claim.village}</td>
                  <td className="py-2 px-4">{claim.district}</td>
                  <td className="py-2 px-4">{claim.state}</td>
                  <td className="py-2 px-4">{claim.claimType}</td>
                  <td className="py-2 px-4">{claim.area}</td>
                  <td className="py-2 px-4">{claim.submissionDate}</td>
                  <td
                    className={`py-2 px-4 font-medium ${
                      claim.status === "approved"
                        ? "text-green-600"
                        : claim.status === "pending"
                        ? "text-yellow-600"
                        : claim.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {claim.status}
                  </td>
                  <td className="py-2 px-4">{claim.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClaims.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              No claims found matching your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}