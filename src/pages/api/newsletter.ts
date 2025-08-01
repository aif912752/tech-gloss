import type { APIRoute } from 'astro';

// Simple in-memory storage for demo (in production, use a database)
const subscribers = new Set<string>();

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, agree } = data;
    
    // Validate input
    if (!email || !agree) {
      return new Response(JSON.stringify({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'รูปแบบอีเมลไม่ถูกต้อง'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Check if already subscribed
    if (subscribers.has(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'อีเมลนี้ได้สมัครแล้ว'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Add to subscribers (in production, save to database)
    subscribers.add(email);
    
    // Log subscription (in production, you might want to send confirmation email)
    console.log(`New newsletter subscription: ${email}`);
    
    // In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email service (Mailchimp, ConvertKit, etc.)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// Get subscriber count (for admin purposes)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    subscriberCount: subscribers.size,
    subscribers: Array.from(subscribers) // Remove this in production for privacy
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};