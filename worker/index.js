// Import necessary modules
const { Worker } = require('bull');
const nodemailer = require('nodemailer');

// Create a Bull worker for processing jobs from 'bookQueue'
const worker = new Worker('bookQueue', async (job) => {
    const { mailOptions } = job.data;

    try {
        // Create a nodemailer transporter
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

        // You can perform additional actions after successfully sending the email if needed

        // Return a result or status if required
        return { status: 'Email sent successfully', to: mailOptions.to };
    } catch (error) {
        console.error('Error sending email:', error);

        // Throw an error if needed
        throw new Error('Error sending email');
    }
});

// Event listener for completed jobs
worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed. Result:`, result);
});

// Event listener for failed jobs
worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// Event listener for job progress (optional)
worker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
});

// Ensure the worker process exits cleanly on SIGTERM
process.on('SIGTERM', async () => {
    console.log('Worker received SIGTERM. Closing the queue.');
    await worker.close();
    process.exit(0);
});

// Start the worker process
worker.start();
