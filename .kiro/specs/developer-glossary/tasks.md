# แผนการพัฒนา

- [x] 1. ตั้งค่า Content Collections และโครงสร้างโปรเจกต์
  - สร้างการกำหนดค่า content collections พร้อม Zod schema validation
  - ตั้งค่าโครงสร้างไดเรกทอรีสำหรับเนื้อหา glossary และ components
  - กำหนดค่า TypeScript types สำหรับ content collections
  - ติดตั้งและกำหนดค่า Tailwind CSS สำหรับ styling
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. สร้างเนื้อหา glossary ตัวอย่าง
  - เขียนไฟล์ Markdown เริ่มต้นสำหรับคำศัพท์เทคนิคหลัก (API, JSON, CI/CD, Promise, Git Rebase, REST)
  - ใช้โครงสร้าง frontmatter ที่ถูกต้องพร้อมฟิลด์ที่จำเป็นทั้งหมด
  - เพิ่มตัวอย่างโค้ดและการอ้างอิงคำศัพท์ที่เกี่ยวข้องในเนื้อหาตัวอย่าง
  - _Requirements: 4.1, 4.2, 4.3, 2.2_

- [x] 3. พัฒนาระบบ layout และ styling พื้นฐาน
  - สร้าง BaseLayout component พร้อมโครงสร้าง HTML และ meta tags ที่เหมาะสม
  - ใช้ Tailwind CSS สำหรับ styling และ theme variables สำหรับโหมดสว่าง/มืด
  - เพิ่มพื้นฐาน responsive design และระบบ typography ด้วย Tailwind
  - _Requirements: 5.1, 5.2, 5.4, 6.2_

- [x] 4. สร้าง core glossary components

- [x] 4.1 สร้าง GlossaryCard component

  - พัฒนา card component เพื่อแสดงสรุปคำศัพท์พร้อมชื่อ หมวดหมู่ และคำอธิบาย
  - เพิ่ม hover effects และ responsive design ด้วย Tailwind CSS
  - รวม category badge styling โดยใช้ Tailwind utility classes
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.2 สร้าง GlossaryLayout component

  - สร้าง layout เฉพาะสำหรับหน้าคำศัพท์แต่ละคำ
  - รวม navigation breadcrumbs และฟังก์ชันกลับไปหน้า glossary
  - เพิ่มการสร้าง meta tag ที่เหมาะสมสำหรับ SEO
  - _Requirements: 2.1, 2.3, 5.2, 5.4_

- [x] 4.3 สร้าง RelatedLinks component

  - พัฒนา component เพื่อแสดงคำศัพท์ที่เกี่ยวข้องพร้อมการสร้างลิงก์อัตโนมัติ
  - เพิ่มตรรกะในการแปลง related term slugs เป็นข้อมูลคำศัพท์เต็ม
  - รวมการจัดกลุ่มตามหมวดหมู่และ styling ที่เหมาะสม
  - _Requirements: 2.4_

- [x] 5. พัฒนาหน้าแรกพร้อมรายการคำศัพท์
  - สร้างหน้า index.astro ที่ดึงคำศัพท์ทั้งหมดโดยใช้ getCollection
  - พัฒนา grid layout ที่แสดง GlossaryCard components ด้วย Tailwind CSS
  - เพิ่มฟังก์ชันการกรองตามหมวดหมู่พร้อม Tailwind styling
  - รวม meta tags และการปรับแต่ง SEO ที่เหมาะสม
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

- [x] 6. สร้างหน้าคำศัพท์แบบ dynamic


  - พัฒนา [slug].astro พร้อม getStaticPaths สำหรับคำศัพท์ทั้งหมด
  - เพิ่มการแสดงผลเนื้อหาที่เหมาะสมพร้อมการประมวลผล Markdown
  - รวมส่วนคำศัพท์ที่เกี่ยวข้องโดยใช้ RelatedLinks component
  - พัฒนาการจัดการข้อผิดพลาดที่เหมาะสมสำหรับคำศัพท์ที่หายไป
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [x] 7. พัฒนา code block component พร้อม syntax highlighting


  - สร้าง CodeBlock component พร้อม syntax highlighting โดยใช้ Prism.js หรือ Shiki
  - เพิ่มฟังก์ชัน copy-to-clipboard พร้อม client-side JavaScript
  - รวมการตรวจจับภาษาและการสนับสนุนหมายเลขบรรทัด
  - _Requirements: 2.2, 2.5, 6.1_

- [x] 8. สร้างฟังก์ชันการค้นหา


- [x] 8.1 สร้างการสร้าง search index


  - พัฒนาการสร้าง search index ในเวลา build จากคำศัพท์ทั้งหมด
  - รวมชื่อคำศัพท์ คำอธิบาย เนื้อหา และ tags ในข้อมูลการค้นหา
  - สร้างไฟล์ JSON search index สำหรับการใช้งานฝั่ง client
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 8.2 พัฒนา SearchBar component
  - สร้าง interactive search component พร้อมการรวม Fuse.js
  - เพิ่มการกรองแบบ real-time พร้อมการจัดการ input แบบ debounced
  - พัฒนาการเน้นผลการค้นหาและการนำทางด้วยคีย์บอร์ด
  - รวม loading states และการจัดการข้อผิดพลาดที่เหมาะสม
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8.3 รวมการค้นหาเข้ากับหน้าแรก
  - เพิ่ม SearchBar component ในหน้าแรกพร้อม client:load directive
  - พัฒนาการแสดงผลการค้นหาที่แทนที่หรือกรอง term grid
  - เพิ่มการจัดการ search state และการสนับสนุน URL parameter
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 9. พัฒนาระบบ theme
  - สร้าง ThemeToggle component พร้อมการเปลี่ยน theme ฝั่ง client
  - เพิ่มการเก็บค่า theme preference ใน localStorage
  - พัฒนา Tailwind dark mode configuration และ CSS custom properties สำหรับตัวแปร theme สว่าง/มืด
  - รวมการตรวจจับค่าตั้งระบบและ fallbacks ที่เหมาะสม
  - _Requirements: 6.2_

- [x] 10. เพิ่มการปรับแต่ง SEO และ meta tag
  - พัฒนาการสร้าง meta tag ที่ครอบคลุมสำหรับทุกหน้า
  - เพิ่มการสนับสนุน Open Graph และ Twitter Card สำหรับการแชร์โซเชียล
  - สร้างการสร้าง sitemap.xml สำหรับการจัดทำดัชนีของ search engine
  - รวม structured data markup สำหรับคำศัพท์
  - _Requirements: 5.2, 5.4_

- [x] 11. สร้างระบบ Email Newsletter
  - พัฒนาระบบสมัครรับข่าวสารทางอีเมลที่ใช้ง่ายสำหรับคนทั่วไป
  - สร้างหน้า Newsletter พร้อมฟอร์มสมัครและตัวอย่างเนื้อหา
  - เพิ่ม API endpoint สำหรับการสมัครสมาชิกและ Quick Signup component
  - รวม RSS feed พื้นฐานสำหรับ developers ที่ต้องการ
  - เพิ่มเติม: 
  - Email service (Resend, SendGrid) Database (supabase) Email templates Scheduler
  - _Requirements: 6.3_

- [x] 12. เพิ่มการจัดการข้อผิดพลาดและหน้า 404
  - สร้างหน้า 404 แบบกำหนดเองพร้อมการนำทางที่มีประโยชน์กลับไปหน้า glossary
  - พัฒนา error boundaries สำหรับความล้มเหลวของ component
  - เพิ่มการตรวจสอบการอ้างอิง related term ในระหว่าง build
  - รวมการลดประสิทธิภาพอย่างสง่างามสำหรับฟีเจอร์ที่ขึ้นอยู่กับ JavaScript
  - _Requirements: 2.1, 3.4_

- [x] 13. พัฒนาฟีเจอร์การเข้าถึง
  - เพิ่ม ARIA labels และโครงสร้าง HTML ที่มีความหมายที่เหมาะสม
  - พัฒนาการนำทางด้วยคีย์บอร์ดสำหรับการค้นหาและองค์ประกอบแบบ interactive
  - รวมการจัดการ focus และการสนับสนุน screen reader
  - เพิ่ม skip links และลำดับชั้น heading ที่เหมาะสม
  - _Requirements: 6.5_

- [x] 14. เขียนการทดสอบที่ครอบคลุม ✅ **เสร็จสิ้นแล้ว**


- [x] 14.1 สร้าง unit tests สำหรับ components ✅ **เสร็จสิ้นแล้ว**
  - เขียนการทดสอบสำหรับ GlossaryCard, SearchBar และ RelatedLinks components
  - ทดสอบการตรวจสอบ content collection schema
  - เพิ่มการทดสอบสำหรับ utility functions และตรรกะการค้นหา
  - _Requirements: 1.1, 1.2, 2.4, 3.2_

- [x] 14.2 เพิ่ม integration tests ✅ **เสร็จสิ้นแล้ว**
  - ทดสอบการสร้างหน้าสำหรับคำศัพท์ทั้งหมด
  - ตรวจสอบฟังก์ชันการค้นหาในสถานการณ์ต่างๆ
  - ทดสอบการสร้าง RSS feed และความถูกต้องของเนื้อหา
  - เพิ่มการทดสอบการเปลี่ยน theme และการเก็บค่า
  - _Requirements: 2.1, 3.1, 6.2, 6.3_

- [x] 15. การปรับแต่งประสิทธิภาพและการขัดเกลาสุดท้าย





  - ปรับแต่งขนาด bundle และพัฒนา code splitting สำหรับฟังก์ชันการค้นหา
  - เพิ่มการปรับแต่งรูปภาพสำหรับรูปภาพที่เกี่ยวข้องกับคำศัพท์
  - พัฒนา prefetching สำหรับคำศัพท์ที่เกี่ยวข้องเมื่อ hover
  - เพิ่มการตรวจสอบประสิทธิภาพและการปรับแต่ง Core Web Vitals
  - _Requirements: 5.1, 5.3_

## ฟีเจอร์ Interactive ใหม่

### Phase 1: การตั้งค่าพื้นฐาน

- [ ] 16. ตั้งค่า Supabase และฐานข้อมูล
  - สร้างโปรเจค Supabase ใหม่
  - ตั้งค่าตารางฐานข้อมูลตาม schema ที่ออกแบบไว้
  - เปิดใช้งาน Row Level Security (RLS) และสร้างนโยบายความปลอดภัย
  - ตั้งค่า environment variables สำหรับ Supabase URL และ API keys
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 17. ตั้งค่าการยืนยันตัวตน
  - สร้าง Supabase client configuration ใน lib/supabase.ts
  - ตั้งค่า GitHub OAuth provider ใน Supabase dashboard
  - พัฒนา AuthButton component สำหรับการเข้าสู่ระบบ/ออกจากระบบ
  - สร้าง auth utilities ใน lib/auth.ts สำหรับการจัดการเซสชัน
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 18. อัปเดต Content Collection Schema
  - เพิ่มฟิลด์ hasComments และ hasQASection ใน content config
  - อัปเดตไฟล์ Markdown ที่มีอยู่ให้รองรับฟิลด์ใหม่
  - สร้าง migration script สำหรับการอัปเดตเนื้อหาเดิม
  - _Requirements: 7.1, 8.1_

### Phase 2: ระบบความคิดเห็น

- [ ] 19. สร้าง API endpoints สำหรับความคิดเห็น
  - พัฒนา /api/comments endpoint สำหรับ CRUD operations
  - เพิ่มการตรวจสอบการยืนยันตัวตนและการจัดการข้อผิดพลาด
  - สร้างการ validate input ด้วย Zod schema
  - รวมการจัดการ rate limiting และการป้องกัน spam
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 20. พัฒนา Comments component
  - สร้าง Comments.astro component สำหรับแสดงความคิดเห็น
  - พัฒนา CommentForm.astro สำหรับการส่งความคิดเห็น
  - เพิ่มการรองรับ Markdown ในความคิดเห็น
  - รวมระบบการโหวตขึ้น/ลงสำหรับความคิดเห็น
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 21. เพิ่มระบบความคิดเห็นในหน้าศัพท์
  - รวม Comments component ใน GlossaryLayout
  - เพิ่มการแสดงความคิดเห็นแบบ real-time ด้วย Supabase subscriptions
  - พัฒนาการจัดการ loading states และ error handling
  - รวมการแสดงรูปโปรไฟล์ผู้ใช้และเวลาที่โพสต์
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

### Phase 3: ระบบคำถาม-คำตอบ

- [ ] 22. สร้าง API endpoints สำหรับคำถาม-คำตอบ
  - พัฒนา /api/questions และ /api/answers endpoints
  - เพิ่มการจัดการ tags และการเชื่อมโยงกับศัพท์
  - สร้างระบบการยอมรับคำตอบที่ดีที่สุด
  - รวมการแจ้งเตือนสำหรับผู้เขียนคำถาม
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 23. พัฒนา Q&A components
  - สร้าง QASection.astro component สำหรับแสดงคำถาม-คำตอบ
  - พัฒนา QuestionForm.astro สำหรับการส่งคำถาม
  - เพิ่มการแสดงสถานะคำถาม (resolved/unresolved)
  - รวมการค้นหาและกรองคำถาม
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 24. รวมระบบ Q&A ในหน้าศัพท์
  - เพิ่ม QASection component ในหน้าศัพท์
  - พัฒนาการแท็กอัตโนมัติคำถามกับศัพท์ปัจจุบัน
  - สร้างการแสดงคำถามที่เกี่ยวข้องกับศัพท์
  - รวมการแจ้งเตือนแบบ real-time
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

### Phase 4: ระบบการมีส่วนร่วม

- [ ] 25. สร้าง API endpoints สำหรับการมีส่วนร่วม
  - พัฒนา /api/contributions endpoint
  - เพิ่มระบบการตรวจสอบและการอนุมัติ
  - สร้างการแจ้งเตือนสำหรับผู้มีส่วนร่วม
  - รวมการจัดการสถานะ (pending/approved/rejected)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 26. พัฒนา ContributionForm component
  - สร้างฟอร์มสำหรับการส่งศัพท์ใหม่
  - เพิ่ม Markdown editor พร้อม preview
  - รวมการเลือกหมวดหมู่และแท็ก
  - พัฒนาการตรวจสอบฟอร์มด้วย Zod
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 27. สร้างหน้า Submit Term
  - พัฒนาหน้าใหม่สำหรับการส่งศัพท์
  - เพิ่มการแสดงสถานะการส่งและการติดตาม
  - รวมการแสดงตัวอย่างศัพท์ที่ได้รับการอนุมัติ
  - สร้างการนำทางจากหน้าหลัก
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

### Phase 5: ระบบการดูแล

- [ ] 28. พัฒนาเครื่องมือการดูแล
  - สร้างหน้า admin dashboard สำหรับผู้ดูแล
  - เพิ่มการจัดการความคิดเห็นที่ถูกรายงาน
  - พัฒนาระบบการอนุมัติ/ปฏิเสธการมีส่วนร่วม
  - รวมการแจ้งเตือนสำหรับการดำเนินการดูแล
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 29. สร้างระบบการรายงาน
  - พัฒนาปุ่มรายงานสำหรับความคิดเห็นและคำถาม
  - เพิ่มการจัดการรายงานในระบบการดูแล
  - สร้างการแจ้งเตือนสำหรับผู้ดูแลเมื่อมีการรายงาน
  - รวมการติดตามประวัติการรายงาน
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### Phase 6: การปรับแต่งและประสิทธิภาพ

- [ ] 30. เพิ่มการติดตามและวิเคราะห์
  - ตั้งค่า Supabase Analytics และ Vercel Analytics
  - พัฒนาการติดตามการใช้งานฟรีเทียร์
  - สร้างการแจ้งเตือนเมื่อเข้าใกล้ขีดจำกัด
  - รวมการติดตาม Core Web Vitals
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 31. ปรับแต่งประสิทธิภาพสำหรับฟรีเทียร์
  - เพิ่มการแคชอย่างแข็งขันสำหรับ API responses
  - พัฒนา rate limiting เพื่อป้องกันการละเมิด
  - สร้างการ fallback ไปยังเนื้อหาแบบสถิตเมื่อ API ล้มเหลว
  - รวมการ optimize การใช้งานฐานข้อมูล
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 32. เพิ่มการทดสอบสำหรับฟีเจอร์ใหม่
  - เขียน unit tests สำหรับ components ใหม่
  - ทดสอบ API endpoints และการจัดการข้อผิดพลาด
  - เพิ่ม integration tests สำหรับการยืนยันตัวตน
  - ทดสอบการทำงานของ real-time features
  - _Requirements: 7.1, 8.1, 9.1, 10.1_

### Phase 7: การปรับปรุงขั้นสูง

- [ ] 33. เพิ่มฟีเจอร์ real-time ขั้นสูง
  - พัฒนา real-time notifications สำหรับผู้ใช้
  - เพิ่มการแสดงผู้ใช้ออนไลน์ในหน้าศัพท์
  - สร้างระบบ typing indicators สำหรับความคิดเห็น
  - รวมการ sync ข้อมูลแบบ real-time ระหว่างแท็บ
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 34. ปรับปรุง UX สำหรับมือถือ
  - เพิ่มการออกแบบ responsive สำหรับฟีเจอร์ใหม่
  - พัฒนา touch-friendly interfaces
  - ปรับแต่งการนำทางสำหรับหน้าจอขนาดเล็ก
  - รวมการ optimize การโหลดสำหรับมือถือ
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 35. เพิ่มฟีเจอร์ขั้นสูง
  - พัฒนาระบบ badges และ achievements สำหรับผู้ใช้
  - สร้างการแสดงสถิติการมีส่วนร่วม
  - เพิ่มระบบการแนะนำศัพท์ที่เกี่ยวข้อง
  - รวมการ export ข้อมูลสำหรับผู้ใช้
  - _Requirements: 7.1, 8.1, 9.1, 10.1_

## การปรับใช้และการติดตาม

- [ ] 36. ปรับใช้บน Vercel
  - ตั้งค่า environment variables ใน Vercel
  - กำหนดค่า custom domain (ถ้ามี)
  - ตั้งค่า monitoring และ error tracking
  - ทดสอบการทำงานของฟีเจอร์ใหม่ใน production
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 37. การทดสอบขั้นสุดท้าย
  - ทดสอบการทำงานของฟีเจอร์ทั้งหมดใน production
  - ตรวจสอบการทำงานของ free tier limits
  - ทดสอบการเข้าถึงและประสิทธิภาพ
  - ตรวจสอบการทำงานของ SEO และ social sharing
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_