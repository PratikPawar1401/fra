import React, { useState } from 'react';

const Library = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Documents' },
    { id: 'policies', name: 'Policies & Guidelines' },
    { id: 'forms', name: 'Forms & Applications' },
    { id: 'reports', name: 'Reports & Studies' },
    { id: 'maps', name: 'Maps & Spatial Data' },
    { id: 'legal', name: 'Legal Documents' },
  ];

  const documents = [
    {
      id: 1,
      title: 'Forest Rights Act 2006 - Complete Act',
      category: 'legal',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      description: 'The complete Forest Rights Act of 2006 with all amendments and guidelines.',
    },
    {
      id: 2,
      title: 'Community Forest Rights Claim Form',
      category: 'forms',
      type: 'PDF',
      size: '256 KB',
      uploadDate: '2024-01-20',
      description: 'Standard form for filing community forest rights claims.',
    },
    {
      id: 3,
      title: 'Tribal Settlement Mapping Guidelines',
      category: 'policies',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-02-01',
      description: 'Guidelines for mapping and documenting tribal settlements.',
    },
    {
      id: 4,
      title: 'Forest Cover Analysis Report 2023',
      category: 'reports',
      type: 'PDF',
      size: '5.2 MB',
      uploadDate: '2024-02-10',
      description: 'Annual report on forest cover changes and impact assessment.',
    },
    {
      id: 5,
      title: 'Maharashtra Tribal Areas Shapefile',
      category: 'maps',
      type: 'ZIP',
      size: '12.1 MB',
      uploadDate: '2024-02-15',
      description: 'GIS data containing boundaries of tribal areas in Maharashtra.',
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Library</h1>
        <p className="text-gray-600">
          Access forms, guidelines, reports, and other resources related to Forest Rights Act implementation.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.map(document => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{document.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {document.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{document.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Size: {document.size}</span>
                  <span>•</span>
                  <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  View
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Library;