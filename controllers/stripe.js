
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Book = require("../models/Book");
const Purchase = require("../models/Purchase");
const revenueIncrease = require("../utils/revenueIncrease");

function generatePurchaseId() {
    return `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-1`;
}

const asyncMiddlewareAuth = (handler) => {

    return async (req, res, next) => {
        try {
            if (req.body.role !== "user") {
                return res.status(401).json({
                    status: 0,
                    message: "Request not authorized.",
                });
            }
            await handler(req, res, next);
        } catch (ex) {
            next(ex);
        }
    };
}

exports.createCheckoutSession = asyncMiddlewareAuth(async (req, res) => {
    const { bookId, quantity, priceRs, userId } = req.body
    // Create a Checkout Session for a single book in Indian Rupees (INR)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'inr', // Set currency to Indian Rupee
                product_data: {
                    name: "book", // Replace with actual product name
                },

                unit_amount: priceRs * 100, // Replace with actual price in paise (e.g., 1000 INR = 100000 paise)
            },
            quantity: quantity || 1, // Default to 1 if quantity is not provided
        }],
        mode: 'payment',
        success_url: 'http://localhost:3000/success', // Replace with your success URL
        cancel_url: 'http://localhost:3000/cancel', // Replace with your cancel URL
        client_reference_id: userId, // Store the userId in the client_reference_id
        reference_bookId: bookId
    })

    res.json({ sessionId: session.id })
})

exports.webhook = asyncMiddlewareAuth(async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_KEY);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.client_reference_id;
            const bookId = session.reference_bookId;
            const price = session.amount_total / 100
            const newPurchase = await Purchase.create({
                purchaseId: generatePurchaseId(),
                bookId: bookId,
                userId: userId,
                price: price,
                quantity: session.display_items[0].quantity,
                purchaseDate: new Date(),
            });
            const book = await Book.findOne({ bookId });
            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }
            // Update author(s) revenue based on the purchase
            const revenueIncrease = price //* quantity;
            await Book.updateOne({ bookId }, { $inc: { sellCount: quantity } }); // Assuming sellCount represents the total sold quantity
            // Notify author(s) about the purchase information
            const authorsId = book.authorsId; // Assuming authors field is an array of author emails
            await revenueIncrease(authorsId, revenueIncrease);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.status(200).end();
})

