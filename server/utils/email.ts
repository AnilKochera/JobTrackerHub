import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { data, error } = await resend.emails.send({
      from: 'JobTrackerHub <noreply@jobtrackerhub.com>',
      to,
      subject,
      text,
      html,
    });

    if (error) {
      logger.error('Failed to send email', { error, to, subject });
      throw error;
    }

    logger.info('Email sent successfully', {
      id: data?.id,
      to,
      subject,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    throw error;
  }
}