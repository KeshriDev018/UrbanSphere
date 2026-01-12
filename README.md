# 🏙️ UrbanSphere
## Society Management Platform – Backend (SaaS-Ready)

UrbanSphere is a **production-grade backend system** for managing residential societies at scale.  
It provides a **secure, role-based, and workflow-driven API** to handle daily society operations such as user onboarding, complaints with SLA, visitor & security management, maintenance billing, payments, notices, packages, staff operations, and multi-society onboarding.

This backend is designed following **real-world SaaS and enterprise backend practices**, not as a demo or toy project.

---

## 🎯 Problem Statement

Residential societies rely on fragmented tools, manual registers, and WhatsApp groups to manage:
- Complaints & maintenance
- Visitor and security logs
- Billing and payments
- Notices and communication
- Staff coordination

UrbanSphere replaces this chaos with a **centralized, secure, API-driven system**.

---

## 🧱 System Architecture

- RESTful API design
- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- MVC + modular architecture
- Secure image & document uploads
- Razorpay payment integration
- Multi-society (multi-tenant ready)

---

## 👥 User Roles & Permissions

UrbanSphere enforces strict access control using middleware.

| Role | Capabilities |
|----|----|
| SuperAdmin | Full system access |
| Admin | Society-level administration |
| Resident | Complaints, visitors, bills, notices |
| Staff | Assigned complaints handling |
| Guard | Visitors & package handling |
| Treasurer | Payments & finance |
| Developer | Platform-level society approval |

---

## 🔐 Authentication & User Management

### Features
- User registration with profile image
- Login, logout & refresh-token flow
- Password change & force reset
- Admin approval for residents
- Admin-created users (staff/admin)
- Role assignment & user deletion

### Key Routes
- `POST /users/register`
- `POST /users/login`
- `POST /users/refresh-token`
- `GET /users/me`
- `PUT /users/updateProfile`
- `PUT /users/changePassword`
- `POST /users/users` (Admin creates users)
- `PUT /users/users/:userId/role`

---

## 🏢 Society Registration (Platform Level)

### Features
- Society registration with document upload
- Developer-only approval flow
- Central society registry

### Routes
- `POST /society/register`
- `PUT /society/approve/:requestId`
- `GET /society/getall`

---

## 🏠 Flat & Resident Management

### Features
- Flat creation & updates
- Assign / remove residents from flats
- Flat-wise resident mapping

### Routes
- `POST /flats/create`
- `GET /flats`
- `GET /flats/:flatId`
- `PUT /flats/assign`
- `PUT /flats/remove`
- `PUT /flats/update/:flatId`

---

## 🛠️ Complaint Management (SLA-Based Workflow)

### Features
- Residents create complaints with **multiple images**
- Admin assigns priority & SLA deadlines
- Complaints assigned to staff
- Status lifecycle management
- Staff-specific complaint dashboards

### Routes
- `POST /complaints/create`
- `GET /complaints/my`
- `PUT /complaints/close/:complaintId`
- `GET /complaints/all`
- `POST /complaints/assign/:complaintId`
- `POST /complaints/priority/:complaintId`
- `POST /complaints/sla/:complaintId`
- `GET /complaints/assigned`
- `POST /complaints/status/:complaintId`

---

## 🧾 Maintenance Billing System

### Features
- Bill creation per flat
- **Bulk bill generation for entire society**
- Bill status updates
- Flat-wise bill history
- Payment linking

### Routes
- `POST /maintenance/create`
- `POST /maintenance/create-bulk`
- `GET /maintenance`
- `GET /maintenance/flat/:flatId`
- `PUT /maintenance/update/:billId`
- `PUT /maintenance/status/:billId`
- `PUT /maintenance/add-payment/:billId`
- `DELETE /maintenance/delete/:billId`

---

## 💳 Payments & Finance (Razorpay Integrated)

### Features
- Order creation
- Payment verification
- Webhook handling
- Flat-wise payment history
- Refund processing

### Routes
- `POST /payments/create-order`
- `POST /payments/verify`
- `POST /payments/webhook`
- `GET /payments/all`
- `GET /payments/flat/:flatId`
- `POST /payments/refund`

---

## 📦 Package Management (Security Workflow)

### Features
- Guard adds package with photo
- Pending package tracking
- Resident package visibility
- Pickup confirmation
- Admin audit control

### Routes
- `POST /packages/create`
- `GET /packages/pending`
- `PUT /packages/pickup/:packageId`
- `GET /packages/my`
- `GET /packages/all`
- `DELETE /packages/delete/:packageId`

---

## 🚶 Visitor Management System

### Features
- Guard creates visitor entry with photo
- Resident approval / rejection
- Visitor exit tracking
- Resident-wise visitor history
- Society-wide visitor visibility

### Routes
- `POST /visitors/create`
- `PUT /visitors/exit/:visitorId`
- `GET /visitors/pending`
- `PUT /visitors/approve/:visitorId`
- `PUT /visitors/reject/:visitorId`
- `GET /visitors/my`
- `GET /visitors/all`
- `DELETE /visitors/delete/:visitorId`

---

## 📢 Notice & Announcement System

### Features
- Notices with file attachments
- Audience-based visibility
- Admin & staff access
- Update & delete lifecycle

### Routes
- `POST /notices/create`
- `PUT /notices/update/:noticeId`
- `DELETE /notices/delete/:noticeId`
- `GET /notices`
- `GET /notices/:noticeId`
- `GET /notices/all/notices/list`

---

## 👷 Staff Management

### Features
- View & manage staff
- Staff profile updates

### Routes
- `GET /staff`
- `GET /staff/:staffId`
- `PUT /staff/update/:staffId`

---

## 🛠️ Tech Stack

- **Backend:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payments:** Razorpay
- **File Uploads:** Multer
- **Tools:** Git, Postman, Nodemon

---

## 📁 Project Structure

src/
├── controllers/
├── routes/
├── models/
├── middlewares/
│ ├── auth.middleware.js
│ ├── verifyRole.middleware.js
│ └── multer.middleware.js
├── utils/
├── app.js
└── server.js


---

## 🚀 Scalability & Production Readiness

- Role-isolated access
- Bulk operations support
- Secure uploads
- Modular expansion
- SaaS-ready architecture

---

## 👨‍💻 Author

**Ankit Keshri**  
Backend-Focused Software Engineer  
IIIT Dharwad

---

## 📜 License

MIT License
