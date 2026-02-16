const mongoose = require("mongoose");

const emailTemplateSchema = mongoose.Schema(
  {
    companyName: { type: String, default: 'SchoolPrep Learning (UPRIO)' },
    headerText: { type: String, default: 'Welcome Aboard!' },
    emailSubject: { type: String, default: 'Welcome Aboard!' },
    hrName: { type: String, default: 'Chinmaya Mohapatra' },
    hrPhone: { type: String, default: '+91 97778 92291' },
    hrEmail: { type: String, default: 'hr@uprio.com' },
    hrTeamName: { type: String, default: 'HR Team, Uprio' },
    companyWebsite: { type: String, default: 'https://www.uprio.com/' },
    companyLogoURL: { type: String, default: '' },
    thingsToCarry: { type: String, default: 'Laptop' },
    pfDeduction: { type: Number, default: 1800 },
    professionalTax: { type: Number, default: 200 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
