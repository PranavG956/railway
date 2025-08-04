import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay with your key and secret from environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a new Razorpay order on the server.
 * @param {number} amount - The amount in paisa (e.g., 10000 for ₹100).
 * @param {string} receipt - A unique receipt ID for the order.
 * @returns {Promise<Object>} The Razorpay order object.
 */
export const createRazorpayOrder = async (amount, receipt) => {
    const options = {
    amount: amount, // Amount in paisa
    currency: 'INR',
    receipt: receipt,
    };
    return razorpay.orders.create(options);
};

/**
 * Verifies the Razorpay payment signature to prevent fraud.
 * @param {string} orderId - The Razorpay order ID.
 * @param {string} paymentId - The Razorpay payment ID.
 * @param {string} signature - The Razorpay signature from the client.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
};
