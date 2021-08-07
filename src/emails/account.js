const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  testMode: process.env.TESTMODE || false,
});

const sendWelcomeEmail = (email, name) => {
  const mailData = {
    from: 'Task API <task_api@mailgun.org>',
    to: email,
    subject: 'Welcome to Task Manager App',
    text: `
${name},

We welcome you to the task manager app.

Please try it out and do let us know your feedback.`,
  };

  shootEmail(mailData);
};

const sendCancellationEmail = (email, name) => {
  const mailData = {
    from: 'Task API <task_api@mailgun.org>',
    to: email,
    subject: 'Task App - Signing out?',
    text: `
${name},

We realized you have deleted your profile from Task App.

Please let us know what went wrong!`,
  };

  shootEmail(mailData);
};

const shootEmail = (mailData) => {
  mg.messages().send(mailData, (err, body) => {
    if (err) {
      throw new Error('Error occured while sending email');
    }
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
