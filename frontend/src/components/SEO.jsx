import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url, type = 'website' }) => {
  const siteName = 'Harshita AI';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      
      {/* Open Graph metadata tags */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content={type} />
      {url && <meta property='og:url' content={url} />}
      <meta property='og:site_name' content={siteName} />

      {/* Twitter metadata tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      
      {/* Canonical URL */}
      {url && <link rel='canonical' href={url} />}
    </Helmet>
  );
};

export default SEO;
