# 🔐 LoginFlow – Advanced MERN Authentication System  
### OTP Login + Signup • JWT Tokens • Resend Email • N8N Workflow Logging • Production CORS • Refresh Token

A professional full-stack authentication system built using **MERN** with:

- ✉ OTP-based Signup + Login  
- ✔ Strong Password Validation  
- 🔁 Email OTP using **Resend API**  
- 🍪 Secure JWT Refresh Token (HTTP-only cookie)  
- 🌍 CORS for Production Deployment  
- 📊 N8N Webhook Logging (Register Info → Google Sheet)  
- 🚀 Deployable on Render + Vercel  
- 🔒 Protected Routes + Auto Token Refresh  
- 🎨 Clean UI (React + Tailwind)

---

# 📌 **Features Overview**

### ✅ Authentication
- Signup with strong password rules  
- Email OTP verification (4-digit)  
- Login with OTP  
- Resend OTP (Register/Login)  
- Session-based refresh tokens  

### 📧 Email System
- Uses **Resend** for email delivery  
- Sends:  
  - Registration OTP  
  - Login OTP  
  - Welcome Email  

### 📊 N8N Integration
Every registration logs data to N8N including:
- Email  
- IST Date  
- IST Time  

Perfect for Google Sheets automation.

### 🌐 Deployment Features
- CORS-safe  
- Cookie-secure  
- Works on Render + Vercel cross-domain  
- Environment-optimized

---

# 📁 **Project Folder Structure**
root/
│── backend/
│ ├── controllers/
│ ├── models/
│ ├── middleware/
│ ├── utils/
│ ├── routes/
│ └── server.js
│
└── frontend/
├── src/
├── context/
├── api/
├── pages/
└── main.jsx

Frontend Setup
1️⃣ Install Frontend
cd frontend
npm install

Backend Setup
2️⃣  Install Backend
cd backend 
npm install
