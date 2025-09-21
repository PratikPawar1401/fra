import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Calendar, FileText, TrendingUp, MapPin, CheckCircle, XCircle, Clock, Award, Activity, Download, Filter, Search, RefreshCw, AlertCircle, Info } from 'lucide-react';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('12months');
  const [selectedState, setSelectedState] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000); // Update every 5 minutes
    return () => clearInterval(timer);
  }, []);

  // Government-appropriate mock data
  const claimsSolvedData = [
    { month: 'Jan 2024', solved: 45, pending: 120, rejected: 12, total: 177 },
    { month: 'Feb 2024', solved: 52, pending: 115, rejected: 18, total: 185 },
    { month: 'Mar 2024', solved: 38, pending: 108, rejected: 15, total: 161 },
    { month: 'Apr 2024', solved: 65, pending: 95, rejected: 22, total: 182 },
    { month: 'May 2024', solved: 71, pending: 88, rejected: 19, total: 178 },
    { month: 'Jun 2024', solved: 58, pending: 82, rejected: 25, total: 165 },
    { month: 'Jul 2024', solved: 79, pending: 75, rejected: 28, total: 182 },
    { month: 'Aug 2024', solved: 82, pending: 68, rejected: 31, total: 181 },
    { month: 'Sep 2024', solved: 91, pending: 62, rejected: 24, total: 177 }
  ];

  const stateWiseData = [
    { name: 'Maharashtra', claims: 245, resolved: 142, pending: 78, rejected: 25 },
    { name: 'Odisha', claims: 189, resolved: 108, pending: 56, rejected: 25 },
    { name: 'Chhattisgarh', claims: 167, resolved: 95, pending: 48, rejected: 24 },
    { name: 'Jharkhand', claims: 143, resolved: 82, pending: 42, rejected: 19 },
    { name: 'Madhya Pradesh', claims: 132, resolved: 78, pending: 38, rejected: 16 },
    { name: 'Andhra Pradesh', claims: 98, resolved: 58, pending: 28, rejected: 12 }
  ];

  const claimStatusData = [
    { name: 'Approved', value: 542, color: '#16A34A' },
    { name: 'Under Review', value: 645, color: '#D97706' },
    { name: 'Rejected', value: 283, color: '#DC2626' }
  ];

  const claimTypeData = [
    { type: 'Individual Forest Rights', count: 789, approved: 456, percentage: 57.8 },
    { type: 'Community Forest Rights', count: 432, approved: 278, percentage: 64.4 },
    { type: 'Community Forest Resources', count: 249, approved: 134, percentage: 53.8 }
  ];

  const totalClaims = claimStatusData.reduce((sum, item) => sum + item.value, 0);
  const totalSolved = claimsSolvedData.reduce((sum, item) => sum + item.solved, 0);
  const avgProcessingDays = 23;
  const successRate = ((claimStatusData[0].value / totalClaims) * 100).toFixed(1);

  const formatDate = (date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Government Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-700 rounded flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Forest Rights Act Dashboard</h1>
                <p className="text-sm text-gray-600">Ministry of Tribal Affairs • Government of India</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Active</span>
              </div>
              <div className="border-l border-gray-300 pl-4">
                <span>Last Updated: {formatDate(lastUpdated)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Time Period:</label>
                <select 
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">State:</label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All States</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="odisha">Odisha</option>
                  <option value="chhattisgarh">Chhattisgarh</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { 
              title: 'Total Claims Received', 
              value: totalClaims.toLocaleString(), 
              icon: FileText,
              description: 'Cumulative claims filed',
              trend: '+12% from last quarter'
            },
            { 
              title: 'Claims Approved', 
              value: claimStatusData[0].value.toLocaleString(), 
              icon: CheckCircle,
              description: 'Successfully processed',
              trend: `${successRate}% approval rate`
            },
            { 
              title: 'Average Processing Time', 
              value: `${avgProcessingDays} days`, 
              icon: Clock,
              description: 'From submission to decision',
              trend: '15% improvement'
            },
            { 
              title: 'Under Review', 
              value: claimStatusData[1].value.toLocaleString(), 
              icon: Activity,
              description: 'Currently being processed',
              trend: 'Pending verification'
            }
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">{kpi.title}</h3>
                </div>
                <div className="mb-2">
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-sm text-gray-600">{kpi.description}</p>
                </div>
                <p className="text-xs text-green-600 font-medium">{kpi.trend}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Trends */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Monthly Claims Processing Trends</h2>
                <p className="text-sm text-gray-600">Approved, Pending, and Rejected claims by month</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={claimsSolvedData}>
                <defs>
                  <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="#16A34A" 
                  fill="url(#approvedGradient)"
                  strokeWidth={2}
                  name="Approved"
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#D97706" 
                  strokeWidth={2}
                  name="Pending"
                />
                <Line 
                  type="monotone" 
                  dataKey="rejected" 
                  stroke="#DC2626" 
                  strokeWidth={2}
                  name="Rejected"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Status Distribution</h2>
            <p className="text-sm text-gray-600 mb-6">Overall claim status breakdown</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={claimStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {claimStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Claims']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {claimStatusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="text-gray-700">{status.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{status.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State-wise Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">State-wise Performance</h2>
          <p className="text-sm text-gray-600 mb-6">Claims processing statistics by state</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Claims</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stateWiseData.map((state, index) => {
                  const successRate = ((state.resolved / state.claims) * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{state.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{state.claims}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{state.resolved}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{state.pending}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{state.rejected}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${successRate}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Types Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Claim Types Analysis</h2>
          <p className="text-sm text-gray-600 mb-6">Performance by different types of forest rights claims</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {claimTypeData.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{type.type}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Claims</span>
                    <span className="font-medium">{type.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-medium text-green-600">{type.approved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium">{type.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            <span>Data is updated every 5 minutes from state reporting systems</span>
          </div>
          <p>For technical support, contact: support@fra-dashboard.gov.in | Helpline: 1800-XXX-XXXX</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;