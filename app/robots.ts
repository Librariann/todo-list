import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/coupons', '/oauth/', '/design-lab'],
    },
    sitemap: 'https://www.growdo.kr/sitemap.xml',
  };
}
