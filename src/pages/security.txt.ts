import type { APIRoute } from 'astro';
import { seoConfig } from '../config/seo.ts';

export const GET: APIRoute = async () => {
  const securityTxt = `# Security Policy for TechGloss
# This file follows RFC 9116: https://tools.ietf.org/rfc/rfc9116.txt

Contact: security@techgloss.dev
Contact: https://github.com/techgloss/security/issues
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: th, en
Canonical: ${seoConfig.siteUrl}/.well-known/security.txt

# Acknowledgments
Acknowledgments: ${seoConfig.siteUrl}/security/acknowledgments

# Policy
Policy: ${seoConfig.siteUrl}/security/policy

# Hiring
Hiring: ${seoConfig.siteUrl}/careers

# Encryption key (if available)
# Encryption: https://keys.openpgp.org/vks/v1/by-fingerprint/YOUR_PGP_KEY_FINGERPRINT`;

  return new Response(securityTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};