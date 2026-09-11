const { prisma } = require('../../models/database');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const path = require('path');
const fs = require('fs');

// Initialize Razorpay
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    return new Razorpay({ key_id, key_secret });
};

// Seed product if missing
const ensureProductExists = async (slug) => {
    let product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
        product = await prisma.product.create({
            data: {
                slug: '7-days-to-your-first-digital-product',
                title: '7 Days to Your First Digital Product',
                shortDescription: 'Launch your first digital product in 7 days.',
                productType: 'ebook',
                regularPrice: 2.99,
                salePrice: 1.19,
                currency: 'USD',
                partNumber: 1,
                status: 'published',
                filePath: '7-Din-Mein-Pehla-Digital-Product.pdf'
            }
        });
    }
    return product;
};

exports.getProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await ensureProductExists(slug);
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { productId, email } = req.body;
        if (!productId || !email) {
            return res.status(400).json({ success: false, error: 'Product ID and email required' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const rzp = getRazorpayInstance();
        const amountInPaise = Math.round(product.salePrice * 100);

        const options = {
            amount: amountInPaise,
            currency: product.currency, // e.g., 'USD'
            receipt: `receipt_${Date.now()}`
        };

        const order = await rzp.orders.create(options);

        // Record Purchase attempt
        const purchase = await prisma.purchase.create({
            data: {
                customerEmail: email,
                productId: product.id,
                amount: product.salePrice,
                currency: product.currency,
                razorpayOrderId: order.id,
                status: 'created'
            }
        });

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        const generatedSignature = crypto.createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }

        // Find the pending purchase
        const purchase = await prisma.purchase.findFirst({
            where: { razorpayOrderId: razorpay_order_id }
        });

        if (!purchase) {
            return res.status(404).json({ success: false, error: 'Purchase record not found' });
        }

        if (purchase.status === 'paid') {
            return res.json({ success: true, message: 'Already verified' });
        }

        // Update purchase and grant entitlement
        await prisma.$transaction([
            prisma.purchase.update({
                where: { id: purchase.id },
                data: {
                    status: 'paid',
                    razorpayPaymentId: razorpay_payment_id
                }
            }),
            prisma.entitlement.upsert({
                where: {
                    customerEmail_productId: {
                        customerEmail: email,
                        productId: purchase.productId
                    }
                },
                update: { status: 'active' },
                create: {
                    customerEmail: email,
                    productId: purchase.productId,
                    source: 'purchase'
                }
            })
        ]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.downloadProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { email } = req.query; // in production, use a signed token or session

        if (!email) {
            return res.status(401).json({ success: false, error: 'Unauthorized. Email required.' });
        }

        const entitlement = await prisma.entitlement.findUnique({
            where: {
                customerEmail_productId: {
                    customerEmail: email,
                    productId: productId
                }
            }
        });

        if (!entitlement || entitlement.status !== 'active') {
            return res.status(403).json({ success: false, error: 'No active entitlement found for this product.' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        
        // Define secure path (outside public directory)
        const securePath = path.join(__dirname, '../../../data/ebooks', product.filePath);
        
        if (!fs.existsSync(securePath)) {
            // Note for the user in response if file missing
            return res.status(404).json({ 
                success: false, 
                error: `File not found on server. Admin must place the file at ${securePath}` 
            });
        }

        res.download(securePath);

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
