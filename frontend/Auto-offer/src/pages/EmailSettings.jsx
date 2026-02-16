import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import { templateAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const EmailSettings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState({
    companyName: '',
    headerText: '',
    emailSubject: '',
    hrName: '',
    hrPhone: '',
    hrEmail: '',
    hrTeamName: '',
    companyWebsite: '',
    companyLogoURL: '',
    thingsToCarry: '',
    pfDeduction: '',
    professionalTax: '',
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await templateAPI.get();
      setTemplate(response.data.template);
    } catch (error) {
      showToast('Failed to load template settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setTemplate({ ...template, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await templateAPI.update(template);
      showToast('Template settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save template settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium mb-3 transition-colors text-sm"
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Email Template Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Customize the offer letter email template sent to candidates</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Company Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="e.g. SchoolPrep Learning (UPRIO)"
                    value={template.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Website
                  </label>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    placeholder="https://www.example.com"
                    value={template.companyWebsite}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="companyLogoURL" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Logo URL
                  </label>
                  <input
                    id="companyLogoURL"
                    name="companyLogoURL"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={template.companyLogoURL}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Email Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Subject
                  </label>
                  <input
                    id="emailSubject"
                    name="emailSubject"
                    type="text"
                    placeholder="e.g. Welcome Aboard!"
                    value={template.emailSubject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="headerText" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Header Text
                  </label>
                  <input
                    id="headerText"
                    name="headerText"
                    type="text"
                    placeholder="e.g. Welcome Aboard!"
                    value={template.headerText}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="thingsToCarry" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Things to Carry
                  </label>
                  <input
                    id="thingsToCarry"
                    name="thingsToCarry"
                    type="text"
                    placeholder="e.g. Laptop, ID Proof"
                    value={template.thingsToCarry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* HR Contact */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                HR Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hrName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    HR Name
                  </label>
                  <input
                    id="hrName"
                    name="hrName"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={template.hrName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="hrPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    HR Phone
                  </label>
                  <input
                    id="hrPhone"
                    name="hrPhone"
                    type="text"
                    placeholder="e.g. +91 97778 92291"
                    value={template.hrPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="hrEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                    HR Email
                  </label>
                  <input
                    id="hrEmail"
                    name="hrEmail"
                    type="email"
                    placeholder="e.g. hr@company.com"
                    value={template.hrEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="hrTeamName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    HR Team Name
                  </label>
                  <input
                    id="hrTeamName"
                    name="hrTeamName"
                    type="text"
                    placeholder="e.g. HR Team, Uprio"
                    value={template.hrTeamName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Salary Deductions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Salary Deduction Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pfDeduction" className="block text-sm font-medium text-gray-700 mb-1.5">
                    PF Deduction (per month)
                  </label>
                  <input
                    id="pfDeduction"
                    name="pfDeduction"
                    type="number"
                    placeholder="e.g. 1800"
                    value={template.pfDeduction}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="professionalTax" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Professional Tax (per month)
                  </label>
                  <input
                    id="professionalTax"
                    name="professionalTax"
                    type="number"
                    placeholder="e.g. 200"
                    value={template.professionalTax}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
