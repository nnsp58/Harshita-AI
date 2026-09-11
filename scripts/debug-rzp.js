const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Razorpay = require('razorpay');

async function testRzp() {
    console.log('KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing');
    console.log('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Configured' : 'Missing');
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const order = await rzp.orders.create({
            amount: 119, // in cents for USD
            currency: 'USD',
            receipt: `rcpt_${Date.now()}`
        });
        console.log('ORDER SUCCESS:', order);
    } catch (err) {
        console.log('ORDER ERROR CAUGHT:');
        console.log(err);
        if (err.error) {
            console.log('Detailed Razorpay error:', JSON.stringify(err.error, null, 2));
        }
    }
}

testRzp();
