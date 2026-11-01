import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.growdo.kr', priority: 1 },
    { url: 'https://www.growdo.kr/guide', priority: 0.7 },
    { url: 'https://www.growdo.kr/support', priority: 0.5 },
  ];
}
