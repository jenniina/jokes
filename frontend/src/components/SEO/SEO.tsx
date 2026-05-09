import React from 'react'
import { Helmet } from 'react-helmet-async'

export interface SEOProps {
  title: string
  description?: string
  canonicalUrl: string
  author?: string
  ogType?: string
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  author = 'Jenniina Laine',
  ogType = 'website',
  ogTitle,
  ogDescription,
  ogUrl,
}: SEOProps) {
  const resolvedOgTitle = ogTitle ?? title
  const resolvedOgDescription = ogDescription ?? description
  const resolvedOgUrl = ogUrl ?? canonicalUrl

  return (
    <Helmet prioritizeSeoTags={true}>
      <meta charSet="utf-8" />
      <meta name="author" content={author} />
      <meta property="og:type" content={ogType} />

      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:title" content={resolvedOgTitle} />
      {resolvedOgDescription ? (
        <meta property="og:description" content={resolvedOgDescription} />
      ) : null}
      {resolvedOgUrl ? (
        <meta property="og:url" content={resolvedOgUrl} />
      ) : null}
    </Helmet>
  )
}
