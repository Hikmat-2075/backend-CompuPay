# backend-CompuPay

Backend API untuk sistem **payroll dan manajemen kepegawaian (HR)** — mencakup presensi karyawan, penggajian, tunjangan/potongan, pengajuan cuti, hingga notifikasi. Dibangun untuk mengotomatisasi proses HR yang biasanya manual, mulai dari pencatatan kehadiran berbasis lokasi hingga penerbitan slip gaji dalam format PDF.

## Tech Stack

- **Runtime:** Node.js (ESM), Express.js
- **ORM & Database:** Prisma ORM dengan PostgreSQL (dilengkapi `prisma-soft-delete-middleware`)
- **Autentikasi:** JWT (`jsonwebtoken`) dengan hashing password bcrypt
- **Validasi:** Joi
- **Penyimpanan file:** AWS S3 (upload dokumen/foto via Multer)
- **Notifikasi push:** Firebase Admin (Firebase Cloud Messaging)
- **Realtime:** Socket.IO / WebSocket
- **Email:** Nodemailer (untuk OTP & notifikasi)
- **Dokumen:** PDFKit (generate slip gaji PDF)
- **Keamanan & observability:** Helmet, CORS, Winston (logging), Morgan
- **Build tool:** Babel
- **Deployment:** Docker

## Fitur Utama

**Autentikasi & Keamanan**
- Registrasi, login, dan refresh token JWT
- Verifikasi akun & reset password via OTP (email)

**Presensi (Attendance)**
- Check-in/check-out dengan validasi lokasi (geolocation) dan foto
- Status kehadiran otomatis (tepat waktu / terlambat / lebih awal)
- Riwayat presensi harian per karyawan

**Penggajian (Payroll)**
- Pengelolaan data payroll karyawan (status pending/dibayar/dibatalkan)
- Generate dan unduh slip gaji dalam format PDF
- Pengelolaan tunjangan (allowances) dan potongan (deductions) per karyawan

**Pengajuan Cuti (Leave Request)**
- Pengajuan cuti/sakit dengan lampiran dokumen pendukung
- Pengelolaan status pengajuan

**Manajemen Organisasi**
- Pengelolaan data departemen dan posisi/jabatan
- Manajemen data karyawan dengan role (User, Admin, Super Admin)

**Notifikasi**
- Notifikasi push via Firebase Cloud Messaging
- Registrasi/penghapusan device token, penandaan sudah dibaca

**Sistem Poin**
- Pencatatan poin karyawan berdasarkan riwayat presensi

## Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js
- PostgreSQL
- Akun AWS S3 (untuk fitur upload) & SMTP/Firebase (untuk notifikasi, opsional saat development awal)

### Langkah instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd CompuPay-BE

# 2. Install dependencies
npm install

# 3. Buat file .env di root project
```

Variabel environment yang perlu disiapkan: `DATABASE_URL`, `PORT`, `FE_URL`, `BE_URL`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `MAILER_HOST`, `MAILER_PORT`, `MAILER_SECURE`, `MAILER_USER`, `MAILER_PASSWORD`, `MAILER_TLS_REJECT_UNAUTHORIZED`, `OTP_EXPIRES_IN`.

```bash
# 4. Migrasi database
npx prisma migrate dev

# 5. Jalankan dalam mode development
npm run dev
```

### Build untuk production

```bash
npm run build
npm start
```

### Menjalankan dengan Docker

```bash
docker build -t compupay-be .
docker run -p <port>:<port> --env-file .env compupay-be
```

## Struktur Folder Singkat

```
src/
├── domains/
│   ├── auth/                # Registrasi, login, OTP, reset password
│   ├── attendance/           # Presensi karyawan
│   ├── payroll/              # Penggajian & slip gaji PDF
│   ├── leaveRequest/          # Pengajuan cuti/sakit
│   ├── notification/          # Notifikasi push (FCM)
│   ├── department/, position/   # Data organisasi
│   ├── allowances/, deductions/  # Tunjangan & potongan
│   └── pointRecord/           # Poin presensi karyawan
├── utils/
│   └── cli/                 # Generator scaffold domain baru
└── config/
prisma/
└── schema.prisma            # Skema database
```
