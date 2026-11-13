
import nodemailer from 'nodemailer'

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
})

export const verifyEmailConnection = async () => {
  try {
    await emailTransporter.verify()

    console.log('Gmail SMTP Connection Successful!')
    return true
  } 
  catch (error) {
    console.error('Gmail SMTP Connection Failed!')
    console.error(error.message)

    return false
  }
}

export default emailTransporter
