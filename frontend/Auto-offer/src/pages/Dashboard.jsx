import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiTrash, HiPencil, HiEye, HiMail, HiDownload } from "react-icons/hi";
import Navbar from "../components/Navbar";
import { candidateAPI, emailAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

const STATUS_CONFIG = {
  pending: { label: "Pending", bgClass: "bg-gray-100", textClass: "text-gray-700" },
  offer_sent: { label: "Offer Sent", bgClass: "bg-purple-100", textClass: "text-purple-800" },
  accepted: { label: "Accepted", bgClass: "bg-green-100", textClass: "text-green-800" },
  rejected: { label: "Rejected", bgClass: "bg-red-100", textClass: "text-red-800" },
  joined: { label: "Joined", bgClass: "bg-blue-100", textClass: "text-blue-800" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeCard, setActiveCard] = useState(null);

  // Analytics stats
  const [stats, setStats] = useState({ totalCandidates: 0, offersSent: 0, offersPending: 0, joiningThisWeek: 0 });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sendingBulk, setSendingBulk] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await candidateAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCandidates = async (
    search = "",
    page = 1,
    limit = itemsPerPage,
    status = statusFilter,
  ) => {
    try {
      setLoading(true);
      const response = await candidateAPI.getAll(search, page, limit, "all", status);
      setCandidates(response.data.candidates || []);
      setPagination(response.data.pagination || {});
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchCandidates(value, 1, itemsPerPage, statusFilter);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCandidates(searchTerm, newPage, itemsPerPage, statusFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchCandidates(searchTerm, 1, newLimit, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setActiveCard(null);
    setCurrentPage(1);
    fetchCandidates(searchTerm, 1, itemsPerPage, newStatus);
  };

  const handleCardClick = (cardKey, filterValue) => {
    if (activeCard === cardKey) {
      // Clicking the same card again resets to show all
      setActiveCard(null);
      setStatusFilter("all");
      setCurrentPage(1);
      fetchCandidates(searchTerm, 1, itemsPerPage, "all");
    } else {
      setActiveCard(cardKey);
      setStatusFilter(filterValue);
      setCurrentPage(1);
      fetchCandidates(searchTerm, 1, itemsPerPage, filterValue);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, []);

  const refreshData = () => {
    fetchCandidates(searchTerm, currentPage, itemsPerPage, statusFilter);
    fetchStats();
  };

  const handleDelete = async () => {
    try {
      await candidateAPI.delete(selectedCandidate._id);
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      showToast("Candidate deleted successfully", "success");
      refreshData();
    } catch (error) {
      showToast("Failed to delete candidate", "error");
    }
  };

  const handleEmailClick = (candidate) => {
    if (!candidate.salaryLPA) {
      showToast("Cannot send email: Salary information is missing", "error");
      return;
    }
    setSelectedCandidate(candidate);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      await emailAPI.sendOfferLetter(selectedCandidate._id);
      setShowEmailModal(false);
      showToast(`Offer letter sent successfully to ${selectedCandidate.email}`, "success");
      refreshData();
    } catch (error) {
      setShowEmailModal(false);
      showToast(error.response?.data?.message || "Failed to send email", "error");
    } finally {
      setSendingEmail(false);
      setSelectedCandidate(null);
    }
  };

  // Bulk email functions
  const isSelectable = (candidate) => {
    return candidate.salaryLPA && candidate.status === "pending" && !candidate.isEmailSent;
  };

  const selectableCandidates = candidates.filter(isSelectable);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(selectableCandidates.map((c) => c._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkSend = async () => {
    if (selectedIds.size === 0) return;
    try {
      setSendingBulk(true);
      const response = await emailAPI.sendBulkOfferLetters(Array.from(selectedIds));
      const { results } = response.data;
      showToast(
        `Sent ${results.success.length} emails. ${results.failed.length} failed.`,
        results.failed.length > 0 ? "warning" : "success",
      );
      setSelectedIds(new Set());
      refreshData();
    } catch (error) {
      showToast(error.response?.data?.message || "Bulk email failed", "error");
    } finally {
      setSendingBulk(false);
    }
  };

  // CSV Export
  const exportToCSV = async () => {
    try {
      const response = await candidateAPI.getAll(searchTerm, 1, 10000, "all", statusFilter);
      const allCandidates = response.data.candidates;

      if (allCandidates.length === 0) {
        showToast("No candidates to export", "warning");
        return;
      }

      const headers = ["Full Name", "Email", "Phone", "Position", "Department", "Salary (LPA)", "Status", "Reporting Date", "Reporting Time", "Reporting Address"];

      const escapeCSV = (value) => {
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = allCandidates.map((c) => [
        c.fullName || "",
        c.email || "",
        c.phone || "",
        c.position || "",
        c.department || "",
        c.salaryLPA || "",
        STATUS_CONFIG[c.status || "pending"]?.label || "Pending",
        c.reportingDate ? new Date(c.reportingDate).toLocaleDateString() : "",
        c.reportingTime || "",
        c.reportingAddress || "",
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `candidates_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${allCandidates.length} candidates to CSV`, "success");
    } catch (error) {
      showToast("Failed to export candidates", "error");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status || "pending"] || STATUS_CONFIG.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Candidates</h1>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => handleCardClick("total", "all")}
            className={`rounded-xl shadow-md p-4 border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-lg ${
              activeCard === "total" ? "bg-blue-50 ring-2 ring-blue-500" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-500 font-medium">Total Candidates</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
          </div>
          <div
            onClick={() => handleCardClick("sent", "sent")}
            className={`rounded-xl shadow-md p-4 border-l-4 border-purple-500 cursor-pointer transition-all hover:shadow-lg ${
              activeCard === "sent" ? "bg-purple-50 ring-2 ring-purple-500" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-500 font-medium">Offers Sent</p>
            <p className="text-2xl font-bold text-gray-900">{stats.offersSent}</p>
          </div>
          <div
            onClick={() => handleCardClick("pending", "pending")}
            className={`rounded-xl shadow-md p-4 border-l-4 border-orange-500 cursor-pointer transition-all hover:shadow-lg ${
              activeCard === "pending" ? "bg-orange-50 ring-2 ring-orange-500" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-500 font-medium">Offers Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.offersPending}</p>
          </div>
          <div
            onClick={() => handleCardClick("joining", "joining_this_week")}
            className={`rounded-xl shadow-md p-4 border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-lg ${
              activeCard === "joining" ? "bg-green-50 ring-2 ring-green-500" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-500 font-medium">Joining This Week</p>
            <p className="text-2xl font-bold text-gray-900">{stats.joiningThisWeek}</p>
          </div>
        </div>

        {/* Search Bar, Filter and Action Buttons */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white whitespace-nowrap"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">All Offers Sent</option>
            <option value="offer_sent">Offer Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="joined">Joined</option>
            <option value="joining_this_week">Joining This Week</option>
          </select>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkSend}
              disabled={sendingBulk}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50"
            >
              {sendingBulk ? "Sending..." : `Send Selected (${selectedIds.size})`}
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
          >
            <HiDownload className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => navigate("/add-candidate")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            + Add Candidate
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No candidates yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first candidate
              </p>
              <button
                onClick={() => navigate("/add-candidate")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                + Add Your First Candidate
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={selectableCandidates.length > 0 && selectableCandidates.every((c) => selectedIds.has(c._id))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Salary (LPA)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Reporting Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr
                      key={candidate._id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap w-10">
                        {isSelectable(candidate) ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(candidate._id)}
                            onChange={() => handleSelectOne(candidate._id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        ) : (
                          <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-200 opacity-30" />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">
                          {candidate.fullName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm">
                        {candidate.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm">
                        {candidate.phone || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {candidate.salaryLPA
                            ? `${candidate.salaryLPA} LPA`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(candidate.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm">
                        {formatDate(candidate.reportingDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              navigate(`/candidate/${candidate._id}`)
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                            title="View"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEmailClick(candidate)}
                            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                            title="Send Offer Letter"
                          >
                            <HiMail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/edit-candidate/${candidate._id}`)
                            }
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                            title="Edit"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center text-sm text-gray-600">
                  {(currentPage - 1) * itemsPerPage + 1} - {" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    pagination.totalCandidates,
                  )}{" "}
                  of {pagination.totalCandidates}

                <div className="flex items-center gap-2 ml-5">
                  <label
                    htmlFor="itemsPerPage"
                    className="text-sm text-gray-600 whitespace-nowrap"
                  >
                    Row per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                 </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              page === currentPage
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 py-1.5 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Confirmation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-[fadeIn_0.2s_ease-in-out]">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Send Offer Letter
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to send the offer letter to:
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {selectedCandidate?.fullName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedCandidate?.email}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Salary:{" "}
                    <span className="font-semibold">
                      ₹{selectedCandidate?.salaryLPA} LPA
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  An email with complete offer details and salary breakdown will
                  be sent.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={sendingEmail}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Sending...
                  </span>
                ) : (
                  "Send Email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-[fadeIn_0.2s_ease-in-out]">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Delete Candidate
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <strong>{selectedCandidate?.fullName}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
