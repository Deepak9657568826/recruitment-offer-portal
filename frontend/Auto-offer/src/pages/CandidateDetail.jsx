import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiPencil } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import { candidateAPI } from '../services/api';

const CandidateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await candidateAPI.getById(id);
      setCandidate(response.data.candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Candidate not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:bg-slate-600 font-medium mb-4 transition-colors"
          >
            <HiArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {candidate.fullName}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {candidate.position || 'Candidate Details'}
              </p>
            </div>
            <button
              onClick={() => navigate(`/edit-candidate/${id}`)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <HiPencil className="mr-2 h-5 w-5" />
              Edit Candidate
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900">{candidate.fullName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-base font-semibold text-gray-900">{candidate.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-base font-semibold text-gray-900">{candidate.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Position</p>
                <p className="text-base font-semibold text-gray-900">{candidate.position || '-'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="text-base font-semibold text-gray-900">{candidate.department || '-'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Salary (LPA)</p>
                <p className="text-xl font-bold text-green-700">
                  {candidate.salaryLPA ? `₹${candidate.salaryLPA}` : '-'}
                </p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${candidate.isEmailSent ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-sm text-gray-600 mb-1">Email Status</p>
                <div className="flex items-center gap-2">
                  {candidate.isEmailSent ? (
                    <>
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-base font-semibold text-purple-700">Offer Letter Sent</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-base font-semibold text-gray-700">Not Sent</p>
                    </>
                  )}
                </div>
              </div>
              {candidate.offerLetterPDF && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Offer Letter PDF</p>
                  <a
                    href={`http://localhost:5000/uploads/${candidate.offerLetterPDF}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Reporting Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Reporting Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reporting Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(candidate.reportingDate)}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reporting Time</p>
                <p className="text-base font-semibold text-gray-900">{candidate.reportingTime || '-'}</p>
              </div>
              <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reporting Address</p>
                <p className="text-base font-semibold text-gray-900">{candidate.reportingAddress || '-'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {candidate.createdAt ? new Date(candidate.createdAt).toLocaleString() : '-'}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleString() : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
