# 🏥 CarePoint - Smart Hospital Management System

**CarePoint** is a full-stack healthcare platform designed to streamline the patient appointment booking process. It features an intelligent triage system, real-time doctor availability checking, secure payment integration, and automated email notifications.

---

## 📸 Screenshots

| **Landing Page** | **Interactive Booking Portal** |
|:---:|:---:|
| ![Landing Page](screenshots/home.png) | ![Booking Form](screenshots/booking.png) |

| **Razorpay Payment Integration** | **Staff Admin Console** |
|:---:|:---:|
| ![Payment Gateway](screenshots/payment.png) | ![Admin Dashboard](screenshots/admin.png) |

---

## ✨ Key Features

### 🩺 **Patient Portal**
- **🧠 AI-Assisted Triage:** - Interactive **SVG Body Map**: Clicking a body part automatically selects the relevant department (e.g., Chest → Cardiology).
  - **Keyword Urgency Detection**: Typing "chest pain" or "bleeding" auto-flags the appointment as **High Priority** and creates a visual alert.
- **📍 Smart Geolocation:** - One-click "Use Current Location" button fetches the user's exact address using the **Geolocation API** and **OpenStreetMap**.
- **💳 Secure Payments:** - Integrated **Razorpay Payment Gateway** to collect consultation fees (UPI, Cards, Netbanking supported).
- **📅 Real-Time Availability:** - Checks database for doctor slots and prevents booking if a doctor is full.

### 👨‍⚕️ **Staff / Admin Console**
- **Dashboard View:** View all pending, confirmed, and cancelled appointments.
- **Status Management:** Staff can Confirm or Cancel appointments.
- **Urgency Highlighting:** High-priority patients are visually highlighted with a red pulse animation.

### 📧 **Automated Notifications**
- **Nodemailer Integration:** - Sends "Booking Received" emails immediately after payment.
  - Sends "Appointment Confirmed" or "Cancelled" emails when staff updates the status.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Responsive & Dark Mode), JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **APIs & Tools:** - **Razorpay API** (Payments)
  - **Nodemailer** (Email Services)
  - **Nominatim API** (Reverse Geocoding)
  - **FontAwesome** (Icons)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/CarePoint-HMS.git](https://github.com/yourusername/CarePoint-HMS.git)
cd CarePoint-HMS
2. Install Dependencies
Bash
npm install
This installs express, mysql2, cors, body-parser, nodemailer, and razorpay.

3. Database Setup (MySQL)
Open your MySQL Workbench and run the following SQL:

SQL
CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(5),
    appointment_date DATE NOT NULL,
    department VARCHAR(50),
    doctor VARCHAR(100),
    severity ENUM('Low', 'Medium', 'High'),
    address TEXT,
    symptoms TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    transaction_id VARCHAR(100),
    amount INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4. Configure Environment
Open server.js and update the following placeholders with your credentials:

MySQL: 'YOUR_MYSQL_PASSWORD'

Razorpay: 'YOUR_RAZORPAY_KEY_ID' & 'YOUR_RAZORPAY_KEY_SECRET'

Nodemailer: 'YOUR_EMAIL@gmail.com' & 'YOUR_APP_PASSWORD'

5. Run the Server
Bash
node server.js
The server will start on http://localhost:3000.

6. Launch the App
Open home.html or index.html in your browser (preferably using Live Server).

🛡️ Future Improvements
[ ] Add User Authentication (Login/Signup) for patients.

[ ] Implement PDF prescription generation.

[ ] Add SMS notifications using Twilio.

Developed by Keerthi Priya A Full-Stack Web Development Project
