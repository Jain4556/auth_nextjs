import nodemailer from "nodemailer"

import User from "@/models/userModel"
import bcryptjs from "bcryptjs"


export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // create a hashedToken
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (email === "verify") {

            await User.findByIdAndUpdate(userId,
                {
                    verifyToken: hashedToken,
                    verifyTokenExpiry: Date.now() + 3600000
                })
        }
        else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                {
                    forgotPasswordToken: hashedToken,
                    forgotPasswordTokenExpiry: Date.now() + 3600000
                })
        }

        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "03ebb65d42098a",
                pass: "03e9966340e79a"
                // TODO: these credential to be added in the env file
            }
        });

        const mailOptions = {
            from: 'sunil@gmail.com',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password", 
            html: `<p>Click <a href="${process.env.domain}/
            verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"}</p>`
        }

       const mailResponse =  await transport.sendMail(mailOptions)

       return mailResponse

    } catch (error: any) {
        throw new Error(error.message)

    }


}