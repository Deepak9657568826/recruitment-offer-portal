const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Calculate salary breakdown based on annual CTC
const calculateSalaryBreakdown = (annualCTC) => {
  const totalMonthlyGross = annualCTC / 12;

  const monthlyBasic = totalMonthlyGross * 0.50; // 50%
  const monthlyHRA = totalMonthlyGross * 0.20; // 20%
  const monthlyConveyance = 1600; // Fixed
  const monthlyMedical = 1250; // Fixed
  const monthlySpecial = totalMonthlyGross - (monthlyBasic + monthlyHRA + monthlyConveyance + monthlyMedical);

  return {
    monthlyBasic: Math.round(monthlyBasic),
    monthlyHRA: Math.round(monthlyHRA),
    monthlyConveyance,
    monthlyMedical,
    monthlySpecial: Math.round(monthlySpecial),
    totalMonthlyGross: Math.round(totalMonthlyGross),
    totalAnnualGross: annualCTC,
  };
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate email HTML template
const generateOfferLetterEmail = (candidate, salaryBreakdown) => {
  const { fullName, reportingAddress, reportingDate, reportingTime, salaryLPA } = candidate;
  const { monthlyBasic, monthlyHRA, monthlyConveyance, monthlyMedical, monthlySpecial, totalMonthlyGross, totalAnnualGross } = salaryBreakdown;

  const formattedDate = reportingDate
    ? new Date(reportingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 10px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .content p { margin: 10px 0; }
        .details-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
        .details-box h3 { margin-top: 0; margin-bottom: 10px; }
        .details-box p { margin: 5px 0; }
        .salary-table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
        .salary-table th, .salary-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .salary-table th { background: #667eea; color: white; font-weight: bold; }
        .salary-table tr:hover { background: #f5f5f5; }
        .total-row { background: #f0f0f0; font-weight: bold; }
        .footer { text-align: left; margin-top: 15px; padding: 15px 0; color: #666; font-size: 14px; }
        .highlight { color: #667eea; font-weight: bold; }
        .note { background: #fff3cd; padding: 12px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
        h3 { margin: 15px 0 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome Aboard!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${fullName}</strong>,</p>

          <p>Congratulations! We are excited to have you join us at <strong>SchoolPrep Learning (UPRIO)</strong>.</p>

          <p>Attached is the offer letter that details the terms of your employment.</p>

          <div class="details-box">
            <h3 style="margin-top: 0; color: #667eea;">📋 Joining Details</h3>
            <p><strong>Reporting Address:</strong> ${reportingAddress || 'To be confirmed'}</p>
            <p><strong>Reporting Date:</strong> ${formattedDate}</p>
            <p><strong>Reporting Time:</strong> ${reportingTime || '11:00 AM'}</p>
            <p><strong>Things to Carry:</strong> Laptop</p>
          </div>

          <p><strong>Salary Package:</strong> <span class="highlight">${formatCurrency(salaryLPA * 100000)} per annum</span></p>

          <p>Welcome aboard, and we look forward to having you on the team.</p>

          <h3>💰 Fixed Salary Breakup</h3>
          <table class="salary-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Amount (Monthly)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly Basic</td>
                <td>${formatCurrency(monthlyBasic)}</td>
              </tr>
              <tr>
                <td>Monthly HRA</td>
                <td>${formatCurrency(monthlyHRA)}</td>
              </tr>
              <tr>
                <td>Monthly Conveyance Allowance</td>
                <td>${formatCurrency(monthlyConveyance)}</td>
              </tr>
              <tr>
                <td>Monthly Medical Allowance</td>
                <td>${formatCurrency(monthlyMedical)}</td>
              </tr>
              <tr>
                <td>Monthly Special Allowance</td>
                <td>${formatCurrency(monthlySpecial)}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total Monthly Gross Salary</strong></td>
                <td><strong>${formatCurrency(totalMonthlyGross)}</strong></td>
              </tr>
              <tr class="total-row">
                <td><strong>Total Annual Gross Salary</strong></td>
                <td><strong>${formatCurrency(totalAnnualGross)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="note">
            <strong>Note:</strong> PF of Rs. 1,800 per month, Professional Tax of Rs. 200 per month and income tax (as applicable) would be deducted from the monthly gross salary to arrive at your monthly net pay.
          </div>

          <p>Please acknowledge this email for confirmation of the offer. If you have any queries regarding the offer, please write back to us or call the undersigned on the given contact number.</p>

          <div class="footer">
            <p style="margin: 0 0 3px 0;"><strong>Warm Regards,</strong></p>
            <p style="margin: 3px 0;">
              <strong>Chinmaya Mohapatra</strong><br>
              PH: +91 97778 92291<br>
              HR Team, Uprio
            </p>
            <p style="margin: 3px 0 10px 0;">
              <a href="mailto:hr@uprio.com" style="color: #667eea; text-decoration: none;">hr@uprio.com</a> ||
              <a href="https://www.uprio.com/" style="color: #667eea; text-decoration: none;">https://www.uprio.com/</a>
            </p>
            <div style="margin-top: 6px;">
              <img src="https://lh3.googleusercontent.com/rd-mail-sig/AIorK4wBelQbdLMzVZUmLUv_ANIdpHlbTvGh2sqj1YYzYbKFUpdYG4fi1Do80LElYFsKBU1PtLncqGFE6MX2LiYernnRU0IfODJiWZDkNH7sdfaAhnz_uXiORdWdUAcf9hicLCEjK_XJ3FwK0Ui4V-KyMH8gCV35VKqCvESIZ3_wZExpNd9PdbS0k2gOY02DPtpvcqMGt5JS3X4SiS16wJEez11dbRuoHX1rJiRYJVZW7Qp-THNTybY94Yhqr0yjnTuvMAMSUjBGt4HCgG7WysXD-uwAinsX9yeOalbuiNIdgv0yg1U0ae5BQvflt8MNzsx_QP2SpBUMNO-pNhaa0jGoW1kYUBPNWwSwq6yrFX39HmL3d0WR8Hyhno5uZelcjOfAxB6PaNC6Vhh4YH7UD7aCJT2viwD7uoAKlrOGmRQRRwZ_CGpsAuNGyq40gAB_DtYXUyD14IEmM2KimX05-3a7-UEHn45fToNrMHlJuiA3WY4a6vtiUboWtSGx1xfpTp7xBh0MC_z15b-AEhYCVi_Rsln8lzcv9MT2-Pagz56vUxBMKlleoYJRwhXpoyB0IEv9sgG_nF8SEzpU0qRt0NnJa27i9oJ4kvtAkdxT2V7rP_yyx_4stpaRA3bgxqDorewp7GEJ5iJ1HD6EeQtCtbza-uV1NmDvtJfcbvvTHLA7i0ovOHZPEvVwUGfGV6kQqn7HcVwCOLI8oPtPMD7wWEgc82458rz7sEZEvSyoCfpTiUPTsPbQIGMjTCN2UL513L8e1K-sZtZKE0h8qgahgMq0ISTwkCzx647RsBlxYAYv2FSEahpabCoMaYAxgFlcMP-FV40mDc1SmM8Ul_546hi1oYIwXHQqBJJ3uDTAISVqCliUNyEsJ3_iIQMTxvsughPixc7bKz2-36KoP1t1LUAwjHj80yvwsT_sUMgbN6LyOaSUZALeBoZD_8xy1Y_aNJEPUQgP3DpVDeFCN-zOe8FVcTa2tK4AMq_ZM3IDHP67DnVxLocQSOBFK4bQmLT4i2wVDZrKBEIo8YUyKQ=s1600" alt="UPRIO Logo" style="height: 40px; width: auto;">
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send offer letter email
const sendOfferLetterEmail = async (candidate) => {
  try {
    const transporter = createTransporter();

    // Calculate salary breakdown
    const annualCTC = candidate.salaryLPA * 100000; // Convert LPA to actual amount
    const salaryBreakdown = calculateSalaryBreakdown(annualCTC);

    // Generate email HTML
    const htmlContent = generateOfferLetterEmail(candidate, salaryBreakdown);

    // Email options
    const mailOptions = {
      from: `"UPRIO HR Team" <${process.env.EMAIL_USER}>`,
      to: candidate.email,
      subject: 'Welcome Aboard!',
      html: htmlContent,
    };

    // Attach PDF if exists
    if (candidate.offerLetterPDF) {
      const pdfPath = path.join(__dirname, '../uploads', candidate.offerLetterPDF);
      if (fs.existsSync(pdfPath)) {
        mailOptions.attachments = [{
          filename: 'Offer_Letter.pdf',
          path: pdfPath
        }];
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      salaryBreakdown,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendOfferLetterEmail,
  calculateSalaryBreakdown,
};
