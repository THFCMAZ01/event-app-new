import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: Number(process.env.ETHEREAL_PORT),
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export async function sendWelcomeEmail(to: string) {
  const options = {
    from: process.env.ETHEREAL_USER,
    to,
    subject: 'Welcome to Event App',
    text: 'Thank you for signing up! Verify your email here: [fake-link]',
  };
  try {
    await transporter.sendMail(options);
    console.log('Welcome email sent to:', to);
  } catch (e) {
    console.error('Email error:', e);
    throw new Error('Failed to send email');
  }
}
