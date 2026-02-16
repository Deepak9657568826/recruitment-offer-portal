const EmailTemplate = require('../model/emailTemplate.model');

const getTemplate = async (req, res) => {
  try {
    let template = await EmailTemplate.findOne();
    if (!template) {
      template = await EmailTemplate.create({});
    }
    res.status(200).json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const allowedFields = [
      'companyName', 'headerText', 'emailSubject', 'hrName', 'hrPhone',
      'hrEmail', 'hrTeamName', 'companyWebsite', 'companyLogoURL',
      'thingsToCarry', 'pfDeduction', 'professionalTax',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    let template = await EmailTemplate.findOne();
    if (!template) {
      template = await EmailTemplate.create(updateData);
    } else {
      Object.assign(template, updateData);
      await template.save();
    }

    res.status(200).json({ message: 'Template updated successfully', template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTemplate, updateTemplate };
