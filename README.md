# 🏙️ UrbanSphere – Society Management System (Backend)

UrbanSphere is a scalable and modular **backend system for residential society management**, built using **Node.js, Express.js, and MongoDB**.  
It is designed to handle real-world society workflows such as authentication, role-based access control, resident management, maintenance tracking, and facility bookings.

---

## 🚀 Project Overview

UrbanSphere simplifies society administration by providing a secure backend with RESTful APIs.  
The system supports multiple user roles and enforces proper permissions using **JWT authentication** and **RBAC**.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (Admin, Resident, Staff)
- Protected routes and secure API access

### 🏠 Resident Management
- Add, update, and remove residents
- Manage resident profiles and roles

### 🛠️ Maintenance Management
- Raise maintenance requests
- Track and update maintenance status

### 📆 Facility Booking
- Book society facilities
- Manage availability and reservations

### 📢 Notices & Announcements
- Publish society-wide notices
- View notice history

### 🧱 Clean & Scalable Architecture
- MVC architecture
- Modular and reusable codebase
- Scalable backend design

---

## 🛠 Tech Stack

- **Backend:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Tools:** Git, Postman, Nodemon

---

## 🧠 API Overview

All APIs follow REST principles and return JSON responses.

### 🔑 Authentication Routes
| Endpoint | Method | Description |
|--------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login and receive JWT |

### 👤 Resident Routes
| Endpoint | Method | Description |
|--------|--------|-------------|
| `/api/residents` | GET | Get all residents |
| `/api/residents/:id` | GET | Get resident by ID |
| `/api/residents` | POST | Add a resident |
| `/api/residents/:id` | PUT | Update resident |
| `/api/residents/:id` | DELETE | Remove resident |

### 🛠 Maintenance Routes
| Endpoint | Method | Description |
|--------|--------|-------------|
| `/api/maintenance` | GET | Get all maintenance requests |
| `/api/maintenance` | POST | Create maintenance request |
| `/api/maintenance/:id` | PATCH | Update request status |

---

## 🧪 Getting Started

### Prerequisites
- Node.js (v14 or above)
- MongoDB (Local or Atlas)
- Postman (for API testing)

### Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/KeshriDev018/UrbanSphere.git
cd UrbanSphere
