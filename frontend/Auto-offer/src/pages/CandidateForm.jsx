import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Navbar from "../components/Navbar";
import { candidateAPI } from "../services/api";

const CandidateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    reportingAddress: "",
    reportingDate: "",
    reportingTime: "",
    salaryLPA: "",
  });
  const [timeHour, setTimeHour] = useState("");
  const [timePeriod, setTimePeriod] = useState("AM");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const response = await candidateAPI.getById(id);
      const candidate = response.data.candidate;

      // Parse reporting time if it exists (format: "9 AM" or "2 PM")
      if (candidate.reportingTime) {
        const timeParts = candidate.reportingTime.split(" ");
        if (timeParts.length === 2) {
          setTimeHour(timeParts[0]);
          setTimePeriod(timeParts[1]);
        }
      }

      setFormData({
        fullName: candidate.fullName || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        position: candidate.position || "",
        department: candidate.department || "",
        reportingAddress: candidate.reportingAddress || "",
        reportingDate: candidate.reportingDate
          ? new Date(candidate.reportingDate).toISOString().split("T")[0]
          : "",
        reportingTime: candidate.reportingTime || "",
        salaryLPA: candidate.salaryLPA || "",
      });
    } catch (error) {
      console.error("Error fetching candidate:", error);
      setError("Failed to load candidate details");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else if (file) {
      setError("Please select a PDF file");
      e.target.value = "";
    }
  };

  const handleTimeChange = (hour, period) => {
    const newHour = hour || timeHour;
    const newPeriod = period || timePeriod;
    if (newHour && newPeriod) {
      setFormData({ ...formData, reportingTime: `${newHour} ${newPeriod}` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (pdfFile) {
        formDataToSend.append("offerLetterPDF", pdfFile);
      }

      if (isEditMode) {
        await candidateAPI.update(id, formDataToSend);
      } else {
        await candidateAPI.create(formDataToSend);
      }
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-medium mb-3 transition-colors text-sm"
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Candidate" : "Add New Candidate"}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Job Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Position
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="Enter position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="salaryLPA"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Salary (LPA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="salaryLPA"
                    name="salaryLPA"
                    type="number"
                    step="0.01"
                    placeholder="Enter salary in LPA"
                    value={formData.salaryLPA}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="offerLetterPDF"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Offer Letter PDF (Optional)
                  </label>
                  <input
                    id="offerLetterPDF"
                    name="offerLetterPDF"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {pdfFile && (
                    <p className="mt-1.5 text-xs text-green-600 flex items-center">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {pdfFile.name} selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reporting Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Reporting Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reportingDate"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Reporting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reportingDate"
                    name="reportingDate"
                    type="date"
                    value={formData.reportingDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reporting Time <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={timeHour}
                      onChange={(e) => {
                        setTimeHour(e.target.value);
                        handleTimeChange(e.target.value, timePeriod);
                      }}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    >
                      <option value="">Hour</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                    <select
                      value={timePeriod}
                      onChange={(e) => {
                        setTimePeriod(e.target.value);
                        handleTimeChange(timeHour, e.target.value);
                      }}
                      required
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="reportingAddress"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Reporting Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reportingAddress"
                    name="reportingAddress"
                    type="text"
                    placeholder="Enter reporting address"
                    value={formData.reportingAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : isEditMode ? (
                  "Update Candidate"
                ) : (
                  "Create Candidate"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;
