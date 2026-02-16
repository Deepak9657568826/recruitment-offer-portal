const express = require('express');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    updateData,
    getCandidateStats,
    updateCandidateStatus,
} = require('../controller/candidate.controller');

const candidateRouter = express.Router();

// All candidate routes require authentication
candidateRouter.post("/createCandidate", authMiddleware, upload.single('offerLetterPDF'), createCandidate);
candidateRouter.get("/getAllCandidates", authMiddleware, getAllCandidates);
candidateRouter.get("/getCandidate/:id", authMiddleware, getCandidateById);
candidateRouter.patch("/updateCandidate/:id", authMiddleware, upload.single('offerLetterPDF'), updateCandidate);
candidateRouter.delete("/deleteCandidate/:id", authMiddleware, deleteCandidate);
candidateRouter.get("/updateData", authMiddleware, updateData);
candidateRouter.get("/candidateStats", authMiddleware, getCandidateStats);
candidateRouter.patch("/updateCandidateStatus/:id", authMiddleware, updateCandidateStatus);

module.exports = {
    candidateRouter
};
