// bookReleases.js

const nodemailer = require("nodemailer");
const User = require("../models/usres");
exports.sendBook = async (authorsId, title, description, price) => {


  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp",
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    let emails = await User.find({ role: "retailer" }, { email: 1, _id: 0 });

    let authors = await User.find({ _id: { $in: authorsId } }, { name: 1, _id: 0 });

    for (let i = 0; i < emails.length; i++) {
      const mailOptions = {
        from: `"Books Care" <${process.env.FROM}>`,
        to: emails[i].email,
        subject: "New Book Notification",
        text: `Dear Retailer,`,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Books Care</a>
            </div>
            <p style="font-size:1.1em">Dear Retailer(s)</p>
            <p>
            A new book, ${title}, has been released by ${authors.map(a => a.name).join(', ')}
             <p>${description}</p>
             <p>price:${price}</p>
              Thank you .
            
            
            </p>
            <h2 style="background: #4044ee;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
               
                
                </h2>
            <p style="font-size:0.9em;">Regards,<br />Books Care</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              
              <p>	www.books.care </p><p>	5th Floor, 5A103 , Two Horizon Center, </p><p> Golf Course Road, DLF Phase-5, Sector- 43</p>Gurugram, Haryana-122002<p>
                  
              </p>
            </div>
          </div>
        </div>`,
      };

      await transporter.sendMail(mailOptions);
      // parentPort.postMessage(emails[i].email);
    }

    // Notify the parent thread that the emails have been sent
    // parentPort.postMessage('Emails sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    parentPort.postMessage(`Error sending emails.`);
  }

};
