const mailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = mailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    })

    //Define options for email
    const emailOptions = {
        from: 'Book My Stay Support<support@bookmystay.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;