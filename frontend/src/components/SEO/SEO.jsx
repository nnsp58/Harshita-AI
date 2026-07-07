import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, canonicalUrl, ogType = 'website', schema }) => {
  const siteTitle = 'Harshita AI - The Ultimate AI Platform by N-Dizi';
  const fullTitle = title ? `${title} | Harshita AI` : siteTitle;
  const defaultDesc = 'Meet Harshita AI, your premium AI-powered service marketplace and smart assistant for Legal, Tax, Jobs, and Automation in India.';
  const defaultKeywords = 'Harshita AI, N-Dizi, AI platform India, Legal AI, Tax AI, Document AI, Automation, CSC Services';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonicalUrl && <link rel="canonical" href={`https://n-dizi.in${canonicalUrl}`} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={`https://n-dizi.in${canonicalUrl || ''}`} />
      <meta property="og:image" content="https://n-dizi.in/og-image.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
