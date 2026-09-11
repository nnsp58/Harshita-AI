const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../index-2-refund-expanded.html');
const cssOutPath = path.join(__dirname, '../frontend/src/pages/ebooks/EbookSalesPage.css');
const jsxOutPath = path.join(__dirname, '../frontend/src/pages/ebooks/EbookSalesPage.jsx');

let html = fs.readFileSync(htmlPath, 'utf8');

// Extract style
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    fs.writeFileSync(cssOutPath, styleMatch[1]);
}

// Extract body
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyContent = bodyMatch ? bodyMatch[1] : html;

// Basic conversions for JSX
bodyContent = bodyContent.replace(/class=/g, 'className=');
bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, ''); // remove comments
// Make sure self-closing tags are closed
bodyContent = bodyContent.replace(/<(img|br|hr|input|meta|link)([^>]*?)([^\/])>/g, '<$1$2$3 />');

// Escape JSX curly braces if any exist in the HTML text
bodyContent = bodyContent.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');

// The prompt says we must dynamically set the CTA button to call our handlePurchase function.
// And replace the hardcoded price if needed. The prompt also says "Preserve: $2.99 Regular Price, $1.19 Limited-Time Launch Offer, GET THIS EBOOK — $1.19".
// For simplicity, we can just attach an onClick handler in a wrapper if we know the class of the button,
// but since it's raw HTML, we'll wrap it in dangerouslySetInnerHTML to avoid endless JSX parse errors.
// Wait, if we use dangerouslySetInnerHTML, we can't easily attach React onClick handlers.
// Let's use a React ref and attach event listeners manually.

const jsxComponent = `
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EbookSalesPage.css';

export default function EbookSalesPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/api/ebooks/products/7-days-to-your-first-digital-product')
            .then(res => setProduct(res.data.product))
            .catch(console.error);
    }, []);

    const handlePurchase = async () => {
        if (!product) return;
        setLoading(true);
        try {
            // Ask for email for guest checkout
            const email = prompt("Enter your email address to receive the eBook:");
            if (!email) {
                setLoading(false);
                return;
            }

            const { data } = await axios.post('/api/ebooks/orders', {
                productId: product.id,
                email
            });

            if (!data.success) throw new Error(data.error);

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "Harshita AI",
                description: product.title,
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/api/ebooks/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            email
                        });
                        if (verifyRes.data.success) {
                            navigate('/ebooks/thank-you', { state: { email, productId: product.id } });
                        } else {
                            alert("Payment verification failed!");
                        }
                    } catch (e) {
                        alert("Error verifying payment.");
                    }
                },
                prefill: { email },
                theme: { color: "#1F4E79" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert(response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error(error);
            alert("Error initiating purchase");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;
        
        // Find all CTA buttons and attach the handlePurchase event.
        // We look for elements that might be the CTA. We know it says "GET THIS EBOOK" or has button-like classes.
        const ctas = containerRef.current.querySelectorAll('a, button');
        ctas.forEach(el => {
            const text = el.innerText || '';
            if (text.includes('GET THIS EBOOK') || el.classList.contains('btn-primary') || el.classList.contains('nav-cta')) {
                el.style.cursor = 'pointer';
                el.onclick = (e) => {
                    e.preventDefault();
                    handlePurchase();
                };
            }
        });

        // Ensure language script functions work if they were in the HTML
        const scriptTags = containerRef.current.querySelectorAll('script');
        scriptTags.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) newScript.src = script.src;
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    }, [product]); // re-attach when product loads just in case

    return (
        <div className="ebook-sales-page">
            <div ref={containerRef} dangerouslySetInnerHTML={{ __html: \`${bodyContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
        </div>
    );
}
`;

fs.writeFileSync(jsxOutPath, jsxComponent);
console.log('Conversion complete!');
