# TechGloss 📚

คลังคำศัพท์ทางเทคนิคสำหรับนักพัฒนาซอฟต์แวร์ เรียนรู้และทำความเข้าใจคำศัพท์ต่างๆ ในโลกของการพัฒนาซอฟต์แวร์

## ✨ Features

- � ค้นหาคำศัพท์ได้อย่างรวดเร็ว
- 📱 Responsive design ใช้งานได้ทุกอุปกรณ์
- 🌙 Dark/Light mode
- 🏷️ จัดหมวดหมู่คำศัพท์
- 🚀 สร้างด้วย Astro + Tailwind CSS v4

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Content**: Markdown with frontmatter
- **Deployment**: Static site generation

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   └── glossary/          # คำศัพท์ในรูปแบบ Markdown
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Layout หลัก
│   │   └── Layout.astro       # Layout พื้นฐาน
│   ├── pages/
│   │   └── index.astro        # หน้าแรก
│   └── styles/
│       └── globals.css        # Tailwind CSS
├── .kiro/
│   └── specs/                 # Specification files
└── package.json
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | ติดตั้ง dependencies                             |
| `npm run dev`             | เริ่ม dev server ที่ `localhost:4321`            |
| `npm run build`           | Build production site ไปที่ `./dist/`           |
| `npm run preview`         | Preview build ก่อน deploy                       |
| `npm run astro ...`       | รัน Astro CLI commands                          |

## 🎯 Getting Started

1. Clone repository
```bash
git clone <repository-url>
cd TechGloss
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. เริ่ม development server
```bash
npm run dev
```

4. เปิดเบราว์เซอร์ไปที่ `http://localhost:4321`

## 📝 การเพิ่มคำศัพท์ใหม่

สร้างไฟล์ Markdown ใหม่ใน `src/content/glossary/` ตามรูปแบบ:

```markdown
---
title: "ชื่อคำศัพท์"
category: "หมวดหมู่"
description: "คำอธิบายสั้นๆ"
---

คำอธิบายแบบละเอียด...
```

## 🤝 Contributing

ยินดีรับ contribution! กรุณาอ่าน contributing guidelines ก่อนส่ง PR

## 📄 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file