const candidateModel = require('../model/candidate.model');
const { sendOfferLetterEmail } = require('../utils/emailService');

const sendEmail = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch candidate details
    const candidate = await candidateModel.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if salary is provided
    if (!candidate.salaryLPA) {
      return res.status(400).json({ message: 'Salary information is required to send offer letter' });
    }

    // Send email
    const result = await sendOfferLetterEmail(candidate);
    // Update candidate record to indicate email has been sent
    console.log("result", result) 
    if(result.success && result.messageId){
      candidate.isEmailSent = true;
      await candidate.save();
    }
    res.status(200).json({
      message: 'Offer letter sent successfully',
      emailId: result.messageId,
      salaryBreakdown: result.salaryBreakdown,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message
    });
  }
};

module.exports = {
  sendEmail,
};
