const CandidateModel = require("../model/candidate.model");

// Create a new candidate
const createCandidate = async (req, res) => {
    const { fullName, email, phone, position, department, reportingAddress, reportingDate, reportingTime, salaryLPA } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
    }

    try {
        const candidate = new CandidateModel({
            fullName,
            email,
            phone,
            position,
            department,
            reportingAddress,
            reportingDate,
            reportingTime,
            salaryLPA,
            offerLetterPDF: req.file ? req.file.filename : null, // Store filename if file uploaded
        });
        await candidate.save();
        res.status(201).json({ message: "Candidate created successfully", candidate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all candidates with search and pagination
const getAllCandidates = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 5, emailStatus } = req.query;

        // Build search query
        const searchQuery = search
            ? {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { position: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        // Add email status filter if provided
        if (emailStatus === 'sent') {
            searchQuery.isEmailSent = true;
        } else if (emailStatus === 'not_sent') {
            searchQuery.isEmailSent = false;
        }
        // If emailStatus is 'all' or undefined, don't add filter

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const totalCandidates = await CandidateModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCandidates / limitNum);

        // Get candidates with pagination
        const candidates = await CandidateModel.find(searchQuery)
            .sort({ createdAt: -1 }) // Most recent first
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            message: "Candidates retrieved successfully",
            candidates,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCandidates,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
    const { id } = req.params;

    try {
        const candidate = await CandidateModel.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json({ message: "Candidate retrieved successfully", candidate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a candidate by ID
const updateCandidate = async (req, res) => {
    const { id } = req.params;
    try {
        const updateData = { ...req.body };
        // If a new file is uploaded, update the PDF field
        if (req.file) {
            updateData.offerLetterPDF = req.file.filename;
        }
        await CandidateModel.findByIdAndUpdate(id, updateData);
        res.status(200).json({ message: "Candidate updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete a candidate by ID
const deleteCandidate = async (req, res) => {
    const { id } = req.params;

    try {
        const candidate = await CandidateModel.findByIdAndDelete(id);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        res.status(200).json({ message: "Candidate deleted successfully", candidate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateData = async (req, res) => {
    try {
        const candidates = await CandidateModel.find();
        console.log("candidates", candidates)
        for (let candidate of candidates) {
            if(candidate.isEmailSent){
                candidate.isEmailSent = false;
                await candidate.save();
                console.log(`Updated candidate ${candidate.fullName} isEmailSent to false`);
            }
        }
        res.status(200).json({ message: "Data updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
   
module.exports = {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    updateData
};
