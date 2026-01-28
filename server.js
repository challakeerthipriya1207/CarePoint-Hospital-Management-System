const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ================= 1. CONFIGURATION =================

// A. Razorpay Setup (Get keys from https://dashboard.razorpay.com)
const razorpay = new Razorpay({
    key_id: 'rzp_test_S9NYpv2q8uAEtK',         // <--- REPLACE WITH RAZORPAY KEY ID
    key_secret: '3T76T5hk22sZ9LYGla8ZAgrF'  // <--- REPLACE WITH RAZORPAY KEY SECRET
});

// B. Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Selen@gomez13', // <--- REPLACE WITH YOUR WORKBENCH PASSWORD
    database: 'hospital_db'
});

db.connect(err => {
    if (err) console.error('❌ Database connection failed:', err);
    else console.log('✅ Connected to MySQL Database');
});

// C. Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'challakeerthipriya39@gmail.com', // Your Email
        pass: 'abllwsvgcabsgmiq'     // <--- REPLACE WITH YOUR 16-CHAR APP PASSWORD
    }
});

// Helper: Send Email Function
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'CarePoint Hospital <challakeerthipriya39@gmail.com>',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('❌ Error sending email:', error);
        } else {
            console.log('📧 Email sent: ' + info.response);
        }
    });
};

// ================= 2. API ROUTES =================

// ROUTE A: Create Payment Order (Razorpay)
app.post('/api/create-order', async (req, res) => {
    const { amount } = req.body;
    
    // Razorpay works in "Paisa" (1 Rupee = 100 Paisa)
    const options = {
        amount: amount * 100, 
        currency: "INR",
        receipt: "receipt_" + Date.now()
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order); // Send Order ID to frontend
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).send("Error creating order");
    }
});

// ROUTE B: Save Appointment (Includes Payment Info) & Send "Received" Email
app.post('/api/appointments', (req, res) => {
    const data = req.body;
    
    // SQL Query now includes payment columns
    const query = `
        INSERT INTO appointments 
        (name, email, phone, dob, blood_group, appointment_date, department, doctor, severity, address, symptoms, status, payment_status, transaction_id, amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `;
    
    const values = [
        data.name, data.email, data.phone, data.dob, data.bloodGroup, 
        data.appointmentDate, data.department, data.doctor, 
        data.severity, data.address, data.symptoms,
        data.paymentStatus || 'paid', data.transactionId || 'N/A', data.amount || 0
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
        } else {
            // Success! Send "Payment Received" Email
            const emailSubject = `Payment Successful - Appointment Pending`;
            const emailBody = `Dear ${data.name},\n\nWe have received your payment of ₹${data.amount}.\nTransaction ID: ${data.transactionId}\n\nYour appointment for ${data.appointmentDate} with ${data.doctor} is currently PENDING review.\n\nWe will notify you shortly once the doctor confirms the slot.\n\nRegards,\nCarePoint Hospital`;
            
            sendEmail(data.email, emailSubject, emailBody);

            res.status(200).send({ message: 'Appointment booked successfully!', id: result.insertId });
        }
    });
});

// ROUTE C: Get all appointments (For Staff Console)
app.get('/api/appointments', (req, res) => {
    const query = 'SELECT * FROM appointments ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) res.status(500).send('Database error');
        else res.json(results);
    });
});

// ROUTE D: Update Status & Send "Confirmed/Cancelled" Email
app.put('/api/appointments/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // 1. UPDATE the status in the database
    const updateQuery = 'UPDATE appointments SET status = ? WHERE id = ?';
    
    db.query(updateQuery, [status, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
            return;
        }

        // 2. FETCH the patient details to send the email
        const selectQuery = 'SELECT * FROM appointments WHERE id = ?';
        db.query(selectQuery, [id], (err, rows) => {
            if (err || rows.length === 0) return;

            const appointment = rows[0];
            let subject = "";
            let body = "";

            if (status === 'confirmed') {
                subject = "Appointment Confirmed - CarePoint Hospital";
                body = `Dear ${appointment.name},\n\nGood news! Your appointment has been CONFIRMED.\n\nPlease visit CarePoint Hospital on ${new Date(appointment.appointment_date).toDateString()}.\n\nDoctor: ${appointment.doctor}\nDepartment: ${appointment.department}\n\nSee you soon!`;
            } 
            else if (status === 'cancelled') {
                // Calculate next few days for suggestion
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dayAfter = new Date();
                dayAfter.setDate(dayAfter.getDate() + 2);

                subject = "Appointment Update - CarePoint Hospital";
                body = `Dear ${appointment.name},\n\nWe regret to inform you that your appointment for ${new Date(appointment.appointment_date).toDateString()} has been CANCELLED due to doctor unavailability.\n\nSuggested Alternative Dates:\nThe doctor is available on:\n- ${tomorrow.toDateString()}\n- ${dayAfter.toDateString()}\n\nPlease visit our portal to re-book your slot. A refund will be processed if applicable.\n\nApologies for the inconvenience.`;
            }

            // Send the email
            if (subject) {
                sendEmail(appointment.email, subject, body);
            }

            res.send({ message: 'Status updated and email sent' });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});