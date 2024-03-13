const nodemailer = require("nodemailer");


// Nodemailer
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
      const info = await transporter.sendMail({
          from: `${process.env.COMPANY_NAME}`, // sender address
          to: options.email, // list of receivers
          subject: options.subject, // Subject line
          text: options.message, // plain text body
          html: `<h1>${options.resetCode}</h1> <br/> <p>Enter this code to complete the reset</p>.
          <br/>
          <p>Thanks for helping us keep your account secure</p>. <br/> <h3>The ${process.env.COMPANY_NAME} Team </h3>`
        });

  };
  
  module.exports = sendEmail;
  

