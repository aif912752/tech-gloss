import type { APIRoute } from 'astro';
import { seoConfig } from '../config/seo.ts';

export const GET: APIRoute = async () => {
  const manifest = {
    name: seoConfig.siteName,
    short_name: "TechGloss",
    description: seoConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: seoConfig.backgroundColor,
    theme_color: seoConfig.themeColor,
    orientation: "portrait-primary",
    scope: "/",
    lang: seoConfig.language,
    dir: "ltr",
    categories: ["education", "reference", "developer-tools"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "TechGloss homepage on desktop"
      },
      {
        src: "/screenshot-narrow.png",
        sizes: "375x812",
        type: "image/png",
        form_factor: "narrow",
        label: "TechGloss homepage on mobile"
      }
    ],
    shortcuts: [
      {
        name: "ค้นหาคำศัพท์",
        short_name: "ค้นหา",
        description: "ค้นหาคำศัพท์ทางเทคนิค",
        url: "/?search=",
        icons: [
          {
            src: "/icon-search.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "คำศัพท์ใหม่",
        short_name: "ใหม่",
        description: "ดูคำศัพท์ที่เพิ่มล่าสุด",
        url: "/?sort=newest",
        icons: [
          {
            src: "/icon-new.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400
    },
    handle_links: "preferred",
    launch_handler: {
      client_mode: "navigate-existing"
    }
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};