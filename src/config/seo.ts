// SEO Configuration for TechGloss
export const seoConfig = {
  // Site Information
  siteName: 'TechGloss',
  siteUrl: 'https://techgloss.dev', // Replace with actual domain
  defaultTitle: 'TechGloss - คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา',
  defaultDescription: 'คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา เรียนรู้และทำความเข้าใจคำศัพท์ต่างๆ ในโลกของการพัฒนาซอฟต์แวร์ พร้อมตัวอย่างโค้ดและคำอธิบายที่เข้าใจง่าย',
  
  // Social Media
  twitterHandle: '@techgloss', // Replace with actual Twitter handle
  facebookAppId: '', // Add if you have Facebook app
  
  // Images
  defaultOGImage: '/og-default.png',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.svg',
  
  // Language and Locale
  language: 'th',
  locale: 'th_TH',
  alternateLocales: ['en_US'], // Add if you support multiple languages
  
  // Theme
  themeColor: '#22c55e',
  backgroundColor: '#ffffff',
  
  // Analytics and Verification
  googleSiteVerification: '', // Add Google Search Console verification code
  bingSiteVerification: '', // Add Bing Webmaster verification code
  yandexVerification: '', // Add Yandex verification code
  
  // RSS and Feeds
  rssTitle: 'TechGloss - คำศัพท์ใหม่และอัปเดต',
  rssDescription: 'ติดตามคำศัพท์ทางเทคนิคใหม่ๆ และการอัปเดตจาก TechGloss',
  
  // Structured Data
  organizationName: 'TechGloss',
  organizationType: 'Organization',
  
  // Default Keywords
  defaultKeywords: [
    'คำศัพท์เทคนิค',
    'นักพัฒนา',
    'โปรแกรมมิ่ง',
    'developer glossary',
    'programming terms',
    'tech dictionary',
    'software development',
    'coding terms'
  ],
  
  // Page-specific configurations
  pages: {
    home: {
      title: 'TechGloss - คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา',
      description: 'คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนา เรียนรู้และทำความเข้าใจคำศัพท์ต่างๆ ในโลกของการพัฒนาซอฟต์แวร์ พร้อมตัวอย่างโค้ดและคำอธิบายที่เข้าใจง่าย',
      keywords: [
        'คำศัพท์เทคนิค',
        'นักพัฒนา',
        'โปรแกรมมิ่ง',
        'developer glossary',
        'programming dictionary',
        'tech terms',
        'software development glossary'
      ]
    }
  },
  
  // Robots.txt configuration
  robots: {
    allowAll: true,
    crawlDelay: 1,
    disallowPaths: ['/admin/', '/.well-known/', '/api/'],
    allowPaths: ['/glossary/']
  },
  
  // Sitemap configuration
  sitemap: {
    changefreq: {
      home: 'daily',
      glossary: 'weekly',
      static: 'monthly'
    },
    priority: {
      home: 1.0,
      glossary: 0.8,
      static: 0.6
    }
  }
};

// Helper functions
export function getFullUrl(path: string): string {
  return `${seoConfig.siteUrl}${path.startsWith('/') ? path : '/' + path}`;
}

export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${seoConfig.siteUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
}

export function generatePageTitle(pageTitle: string, includesSiteName: boolean = false): string {
  if (includesSiteName) {
    return pageTitle;
  }
  return `${pageTitle} | ${seoConfig.siteName}`;
}