import Mailjet from 'node-mailjet';
import { emailVerificationTemplate } from './email-templates';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET,
});

export async function sendVerificationEmail(email: string, token: string, expiresAt: Date, name: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const verificationUrl = `${appUrl}/auth/verify/${token}`;

    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: process.env.MAIL_SENDER_NAME,
          },
          Subject: 'verify your email. • wriders.',
          CustomID: `${token}-${Date.now()}-email-verification`.substring(0, 40),
          To: [
            {
              Email: email,
              Name: name,
            },
          ],
          HTMLPart: emailVerificationTemplate(verificationUrl, expiresAt, name),
        },
      ],
    });

    return {
      success: true,
      message: 'Verification email sent successfully',
      data: result.body,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email',
    };
  }
}

export default mailjet;
