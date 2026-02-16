const mongoose = require("mongoose");

const candidateSchema =  mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,

    position: String,
    department: String,

    reportingAddress: String,
    reportingDate: Date,
    reportingTime: String,

    salaryLPA: Number,
    offerLetterPDF: String, // Path to uploaded PDF file
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'offer_sent', 'accepted', 'rejected', 'joined'],
      default: 'pending',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Candidate", candidateSchema);
