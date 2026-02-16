import type { MetadataRoute } from 'next';
import { getYear } from 'date-fns';

const BASE_URL = 'https://kolkoshtepochivam.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentYear = getYear(new Date());

  // Main page (current year) — highest priority
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];

  // Year variants: current year ±2 (covers what users typically browse)
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    entries.push({
      url: `${BASE_URL}/?year=${year}`,
      lastModified: new Date(),
      changeFrequency: year < currentYear ? 'yearly' : 'monthly',
      priority: year === currentYear ? 0.9 : 0.7,
    });
  }

  return entries;
}
