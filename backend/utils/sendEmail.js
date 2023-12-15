const nodemailer = require("nodemailer")
module.exports = async (userEmail, subject, htmlTemplate) => {
    try {
        const transporter = nodemailer.createTransport({
            service : "gmail",
            auth : {
                user : process.env.EMAIL,
                pass : process.env.EMAIL_APP_PASSWORD
            }
        })
        const mailOptions = {
            from : process.env.EMAIL,
            to : userEmail,
            subject : subject,
            html :htmlTemplate
        }
        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent : " + info.response)
    } catch (error) {
        console.log(error)
        throw new Error ("Internal Server Error (nodemailer)")
    }
}