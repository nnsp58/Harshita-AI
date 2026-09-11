import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function ThankYouPage() {
    const location = useLocation();
    const { email, productId } = location.state || {};
    const [downloading, setDownloading] = useState(false);

    if (!email || !productId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Purchase Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't verify your recent purchase in this session.</p>
                    <Link to="/ebooks" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        Back to Store
                    </Link>
                </div>
            </div>
        );
    }

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Initiate a secure download
            window.location.href = `/api/ebooks/download/${productId}?email=${encodeURIComponent(email)}`;
            setTimeout(() => setDownloading(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Error initiating download.");
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl text-center border-t-4 border-green-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-lg text-gray-600 mb-8">Thank you for your purchase. Your eBook is ready.</p>
                
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-8 text-sm">
                    <strong>Important:</strong> Keep your purchase email ({email}) safe for future access.
                </div>

                <button 
                    onClick={handleDownload} 
                    disabled={downloading}
                    className="w-full bg-[#1F4E79] hover:bg-[#12365C] text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2"
                >
                    {downloading ? 'Preparing Download...' : 'DOWNLOAD YOUR EBOOK'}
                </button>
            </div>
        </div>
    );
}
