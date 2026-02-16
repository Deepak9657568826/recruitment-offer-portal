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
      candidate.status = 'offer_sent';
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

const sendBulkEmail = async (req, res) => {
  const { candidateIds } = req.body;

  if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of candidate IDs' });
  }

  try {
    const candidates = await candidateModel.find({ _id: { $in: candidateIds } });
    const results = { success: [], failed: [] };

    for (const candidate of candidates) {
      try {
        if (!candidate.salaryLPA) {
          results.failed.push({ id: candidate._id, name: candidate.fullName, reason: 'Missing salary information' });
          continue;
        }
        if (candidate.isEmailSent) {
          results.failed.push({ id: candidate._id, name: candidate.fullName, reason: 'Email already sent' });
          continue;
        }

        const result = await sendOfferLetterEmail(candidate);
        if (result.success && result.messageId) {
          candidate.isEmailSent = true;
          candidate.status = 'offer_sent';
          await candidate.save();
          results.success.push({ id: candidate._id, name: candidate.fullName });
        }
      } catch (emailError) {
        results.failed.push({ id: candidate._id, name: candidate.fullName, reason: emailError.message });
      }
    }

    res.status(200).json({
      message: `Sent ${results.success.length} of ${candidates.length} emails`,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk email failed', error: error.message });
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
};
