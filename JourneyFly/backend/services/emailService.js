const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    const isSmtpConfigured =
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS;

    if (!isSmtpConfigured) {
        console.log("\n==================================================");
        console.log(`✉️  MOCK EMAIL SENT TO: ${to}`);
        console.log(`📝 SUBJECT: ${subject}`);
        console.log("📄 CONTENT:");
        console.log(html.replace(/<[^>]*>/g, " ").trim()); // strip tags for readability
        console.log("==================================================\n");
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: parseInt(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"JourneyFly" <noreply@journeyfly.com>',
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        // Do not crash the server on email errors in dev environments; just log it
        return false;
    }
};

module.exports = { sendEmail };
