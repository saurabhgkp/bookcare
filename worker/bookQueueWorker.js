// bookQueueWorker.js
const { Worker } = require('bull');
const nodemailer = require('nodemailer');
const worker = new Worker('bookQueue', async (job) => {
    console.log("bookQueueWorker", "--------------------1")
    const { mailOptions } = job.data;

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp',
            secure: true,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
            },
        });

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', mailOptions.to);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email.');
    }
});

// Start processing jobs
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// Ensure the worker process exits cleanly
process.on('SIGTERM', async () => {
    console.log('Worker received SIGTERM. Closing the queue.');
    await worker.close();
    process.exit(0);
});
