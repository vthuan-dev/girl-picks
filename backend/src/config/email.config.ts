export default () => ({
  smtp: {
    // Support both SMTP_* and EMAIL_* prefixes for flexibility
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(
      process.env.SMTP_PORT || process.env.EMAIL_PORT || '587',
      10,
    ),
    secure:
      process.env.SMTP_SECURE === 'true' ||
      process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
    from:
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      'noreply@girlpick.com',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});

