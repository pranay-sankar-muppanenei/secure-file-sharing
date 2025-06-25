# 🔐 Secure File Sharing System

A Node.js + SQLite-based REST API that enables secure file sharing between Ops and Client users.

## 🚀 Features

- 🧑‍💼 **Ops User**
  - Login
  - Upload `.pptx`, `.docx`, `.xlsx` only

- 👤 **Client User**
  - Signup (gets encrypted email verification link)
  - Email Verification
  - Login
  - List all uploaded files
  - Download via secure, time-limited tokenized link

---

## 📩 Postman Collection

- `secure-file-sharing.postman_collection.json` is included in the root folder.
- Use it in Postman to test all endpoints easily.

---

## 🧪 Test Cases (Optional / Bonus)

> These are manual test flows for now. You can write automated tests using `jest` if needed.

### ✅ Client Signup
- POST `/auth/signup`  
  → Should return email verification link

### ✅ Email Verification
- GET `/auth/verify/:token`  
  → Should update `is_verified = 1`

### ✅ Ops Upload
- POST `/ops/upload` with a valid `.docx`  
  → Should return uploaded file metadata

### ✅ List Files
- GET `/client/files`  
  → Returns list of all uploaded files

### ✅ Download Link
- GET `/client/download-link/:id`  
  → Returns secure tokenized link

### ✅ Download
- GET `/client/download/:token`  
  → Downloads file if token valid & user is client

---

## 🌐 Deployment Plan

> Here’s how I would deploy this in a real-world scenario:

1. **Backend Hosting**: Use [Render](https://render.com) or [Railway](https://railway.app)
2. **Database**:
   - Development: SQLite
   - Production: PostgreSQL (if scaling needed)
3. **Email Provider**:
   - Use SMTP provider like SendGrid / Mailgun / Gmail SMTP
4. **File Storage**:
   - Local `/uploads` for dev
   - Cloud storage (like AWS S3) for production
5. **Security**:
   - Use `.env` for JWT and DB secrets
   - Token expiry enforced for download links

---

## ✅ How to Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/secure-file-sharing.git
cd secure-file-sharing

npm install
node server.js  # or use nodemon
