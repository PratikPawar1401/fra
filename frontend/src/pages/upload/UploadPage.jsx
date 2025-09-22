import React, { useState } from 'react';

const StructuredUpload = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimType, setClaimType] = useState('');
  const [formSubtype, setFormSubtype] = useState('');
  const [mainFormFile, setMainFormFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFields, setExtractedFields] = useState(null);
  const [formData, setFormData] = useState({});
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const claimTypes = {
    new_claim: {
      name: 'New Claim',
      description: 'For new forest rights claims',
      subtypes: {
        'IFR': 'Individual Forest Rights (Form A)',
        'CR': 'Community Rights (Form B)', 
        'CFR': 'Community Forest Rights (Form C)'
      }
    },
    legacy_claim: {
      name: 'Legacy Claim',
      description: 'For existing/granted forest rights titles',
      subtypes: {
        'Granted Title': 'Previously granted forest rights'
      }
    }
  };

  const steps = [
    { number: 1, title: 'Claim Type', description: 'Select your claim type' },
    { number: 2, title: 'Upload Form', description: 'Upload your claim form' },
    { number: 3, title: 'Verify Details', description: 'Review extracted information' },
    { number: 4, title: 'Supporting Documents', description: 'Upload additional documents' },
    { number: 5, title: 'Submit', description: 'Submit your claim' }
  ];

  const handleClaimTypeNext = () => {
    if (claimType && formSubtype) {
      setCurrentStep(2);
    }
  };

  const handleFormUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainFormFile(file);
    }
  };

  const processFormWithOCR = async () => {
    if (!mainFormFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', mainFormFile);
      formData.append('form_type', claimType);

      const response = await fetch('http://localhost:8001/process-form', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result = await response.json();
      setExtractedFields(result.extracted_fields);
      setFormData(result.extracted_fields);
      setCurrentStep(3);
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('Failed to process the form. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const addSupportingDocument = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      type: 'supporting',
      uploaded: false
    }));
    setSupportingDocuments(prev => [...prev, ...newDocs]);
  };

  const removeSupportingDocument = (docId) => {
    setSupportingDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const uploadToCloudinary = async (file, documentType = 'supporting') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    try {
      const response = await fetch('http://localhost:8001/upload-document', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const submitClaim = async () => {
    setIsSubmitting(true);
    try {
      // Upload main form to Cloudinary
      const mainFormUrl = await uploadToCloudinary(mainFormFile);
      
      // Upload supporting documents to Cloudinary
      const supportingUrls = [];
      for (const doc of supportingDocuments) {
        const url = await uploadToCloudinary(doc.file);
        if (url) {
          supportingUrls.push({
            name: doc.name,
            url: url,
            type: 'supporting'
          });
        }
      }

      // Submit to your backend
      const claimData = {
        claimant_name: formData.FullName || formData.HolderNames || '',
        district: formData.District || '',
        village_name: formData.Village || formData.VillageOrGramSabha || '',
        form_type: `${claimTypes[claimType].name} - ${formSubtype}`,
        main_document_url: mainFormUrl,
        supporting_documents: supportingUrls,
        extracted_fields: formData,
        status: 'Submitted'
      };

      const response = await fetch('http://localhost:8001/submit-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Claim submitted successfully! Claim ID: ${result.claim_id}`);
        // Reset form or redirect
        // Consider using a success modal instead of alert
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step.number 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.number}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 ${
                currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Claim Type</h2>
      
      <div className="space-y-4 mb-6">
        {Object.entries(claimTypes).map(([key, type]) => (
          <label key={key} className="cursor-pointer">
            <input
              type="radio"
              name="claimType"
              value={key}
              checked={claimType === key}
              onChange={(e) => {
                setClaimType(e.target.value);
                setFormSubtype('');
              }}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg transition-colors ${
              claimType === key 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <h3 className="font-semibold text-gray-800">{type.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          </label>
        ))}
      </div>

      {claimType && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Form Type
          </label>
          <select
            value={formSubtype}
            onChange={(e) => setFormSubtype(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Choose form type...</option>
            {Object.entries(claimTypes[claimType].subtypes).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleClaimTypeNext}
        disabled={!claimType || !formSubtype}
        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Next Step
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Claim Form</h2>
      
      <div className="mb-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>Selected:</strong> {claimTypes[claimType].name} - {claimTypes[claimType].subtypes[formSubtype]}
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        
        {mainFormFile ? (
          <div className="text-green-600">
            <p className="font-medium">File Selected:</p>
            <p className="text-sm">{mainFormFile.name}</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Upload your claim form</h3>
            <p className="text-gray-600 mb-4">PDF format recommended</p>
          </div>
        )}

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFormUpload}
          className="hidden"
          id="formUpload"
        />
        <label
          htmlFor="formUpload"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
        >
          {mainFormFile ? 'Change File' : 'Select File'}
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={processFormWithOCR}
          disabled={!mainFormFile || isProcessing}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Process Form'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const fields = claimType === 'new_claim' 
      ? ['FullName', 'District', 'Village', 'Address', 'GramPanchayat', 'Tehsil']
      : ['HolderNames', 'District', 'VillageOrGramSabha', 'Address', 'GramPanchayat', 'Tehsil'];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Extracted Information</h2>
        <p className="text-gray-600 mb-6">Please review and correct the information extracted from your form:</p>

        <div className="space-y-4 mb-6">
          {fields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                value={formData[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Supporting Documents</h2>
      <p className="text-gray-600 mb-6">Upload any supporting documents for your claim (optional):</p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={addSupportingDocument}
          className="hidden"
          id="supportingDocs"
        />
        <label
          htmlFor="supportingDocs"
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Add Supporting Documents
        </label>
      </div>

      {supportingDocuments.length > 0 && (
        <div className="space-y-2 mb-6">
          {supportingDocuments.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{doc.name}</span>
              <button
                onClick={() => removeSupportingDocument(doc.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Review & Submit</h2>
      
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800">Claim Type</h3>
          <p className="text-sm text-gray-600">{claimTypes[claimType].name} - {formSubtype}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800">Main Form</h3>
          <p className="text-sm text-gray-600">{mainFormFile?.name}</p>
        </div>

        {supportingDocuments.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800">Supporting Documents</h3>
            <ul className="text-sm text-gray-600">
              {supportingDocuments.map(doc => (
                <li key={doc.id}>• {doc.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(4)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={submitClaim}
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Forest Rights Claim</h1>
        <p className="text-gray-600">
          Follow the steps below to submit your forest rights claim application.
        </p>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
    </div>
  );
};

export default StructuredUpload;