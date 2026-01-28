document.addEventListener('DOMContentLoaded', () => {
    // 1. Enhanced Data Source (Medical Departments & Doctors)
    const medicalData = {
        "General Medicine": { docs: ["Dr. Sharma | MBBS, MD (Internal) | 12 Yrs Exp", "Dr. Rao | MBBS | 8 Yrs Exp"], fee: 300, limit: 5 },
        "Cardiology": { docs: ["Dr. Gupta | MBBS, MS, M.Ch (Cardio) | 15 Yrs Exp", "Dr. Iyer | MBBS, MD | 10 Yrs Exp"], fee: 700, limit: 3 },
        "Neurology": { docs: ["Dr. Khan | MBBS, MD, DM (Neuro) | 20 Yrs Exp", "Dr. Singh | MBBS, MD | 9 Yrs Exp"], fee: 700, limit: 3 },
        "Dermatology": { docs: ["Dr. Kapoor | MBBS, DDVL (Skin) | 11 Yrs Exp", "Dr. Malhotra | MBBS, MD | 7 Yrs Exp"], fee: 700, limit: 4 },
        "Orthopedics": { docs: ["Dr. Verma | MS (Orthopedics) | 14 Yrs Exp", "Dr. Reddy | MBBS, MS | 10 Yrs Exp"], fee: 600, limit: 4 }
    };

    // DOM Elements
    const bookingForm = document.getElementById('bookingForm');
    const deptSelect = document.getElementById('deptSelect');
    const docSelect = document.getElementById('docSelect');
    const appDateInput = document.getElementById('appDate');
    const feeDisplay = document.getElementById('feeDisplay');
    const bodyParts = document.querySelectorAll('.body-part');
    
    // Urgency Logic Elements
    const symptomsArea = document.getElementById('symptoms');
    const severitySelect = document.getElementById('severity');
    const submitBtn = bookingForm.querySelector('.btn-submit');
    const urgencyNotice = document.getElementById('urgencyNotice');

    // ================= 2. AI SIMULATION: KEYWORD MATCHING =================
    const criticalKeywords = ["chest pain", "breathless", "bleeding", "unconscious", "stroke", "seizure", "fracture", "severe"];

    if (symptomsArea) {
        symptomsArea.addEventListener('input', (e) => {
            const text = e.target.value.toLowerCase();
            const isCritical = criticalKeywords.some(keyword => text.includes(keyword));

            if (isCritical) {
                severitySelect.value = "High"; // Auto-switch to High
                submitBtn.classList.add('pulse-urgent'); // Visual pulse
                if (urgencyNotice) urgencyNotice.style.display = "block"; // Show notice
            } else {
                submitBtn.classList.remove('pulse-urgent');
                if (urgencyNotice) urgencyNotice.style.display = "none";
            }
        });
    }

    // ================= 3. AVAILABILITY LOGIC (ASYNC) =================
    // Fetches live data from the server to count booked slots
    const updateDoctorList = async () => {
        const dept = deptSelect.value;
        const selectedDate = appDateInput.value;
        
        // Fetch current appointments from server
        const appointments = await getAppointments();

        docSelect.innerHTML = '<option value="">Select Doctor</option>'; 
        if (dept && medicalData[dept]) {
            docSelect.disabled = false;
            const deptLimit = medicalData[dept].limit;
            
            medicalData[dept].docs.forEach(docDetail => {
                let statusMsg = "Available";
                let isFull = false;
                
                if (selectedDate) {
                    // Filter server data to count existing bookings
                    const bookedCount = appointments.filter(app => 
                        app.doctor.includes(docDetail.split('|')[0].trim()) && 
                        (app.appointment_date && app.appointment_date.startsWith(selectedDate)) && 
                        app.status !== 'cancelled'
                    ).length;

                    const remaining = deptLimit - bookedCount;
                    
                    if (remaining <= 0) { statusMsg = "FULL"; isFull = true; }
                    else if (remaining <= 2) { statusMsg = `High Demand: ${remaining} left`; }
                    else { statusMsg = `${remaining} slots left`; }
                }

                const opt = document.createElement('option');
                opt.value = `${docDetail} (${statusMsg})`; 
                opt.textContent = `${docDetail} — [${statusMsg}]`;
                if (isFull) opt.disabled = true;
                docSelect.appendChild(opt);
            });
            feeDisplay.textContent = `Consultation Fee: ₹${medicalData[dept].fee}`;
        } else {
            docSelect.disabled = true;
            feeDisplay.textContent = `Consultation Fee: ₹0`;
        }
    };

    // ================= 4. INTERACTION LISTENERS (BODY MAP) =================
    bodyParts.forEach(part => {
        part.addEventListener('click', function() {
            const targetDept = this.getAttribute('data-dept');
            bodyParts.forEach(p => p.classList.remove('selected-part'));
            this.classList.add('selected-part');
            
            // Set department and trigger update
            deptSelect.value = targetDept;
            updateDoctorList(); 
            
            // UX: Scroll to doctor select
            docSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // Event Listeners for Dropdowns
    deptSelect.addEventListener('change', updateDoctorList);
    appDateInput.addEventListener('change', updateDoctorList);

    // ================= 5. GEOLOCATION LOGIC =================
    const geoBtn = document.getElementById('geoBtn');
    const addressInput = document.getElementById('address');
    const geoStatus = document.getElementById('geoStatus');

    if (geoBtn) { 
        geoBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            if (geoStatus) {
                geoStatus.style.display = 'block';
                geoStatus.textContent = "📍 Locating you...";
                geoStatus.style.color = "#3498db";
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                if (geoStatus) geoStatus.textContent = "🌏 Fetching address...";

                try {
                    // Using OpenStreetMap (Nominatim)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        addressInput.value = data.display_name;
                        if (geoStatus) {
                            geoStatus.textContent = "✅ Location found!";
                            geoStatus.style.color = "#27ae60";
                            setTimeout(() => { geoStatus.style.display = 'none'; }, 3000);
                        }
                    } else {
                        throw new Error("Address not found");
                    }
                } catch (error) {
                    console.error("Geocoding Error:", error);
                    if (geoStatus) {
                        geoStatus.textContent = "❌ Could not fetch address. Please type manually.";
                        geoStatus.style.color = "#e74c3c";
                    }
                    addressInput.placeholder = "Unable to auto-locate. Please enter address manually.";
                }

            }, (error) => {
                console.warn("Geolocation Error:", error);
                let msg = "Unable to retrieve location.";
                if (error.code === 1) msg = "⚠️ Location permission denied.";
                else if (error.code === 2) msg = "⚠️ Location unavailable.";
                
                if (geoStatus) {
                    geoStatus.textContent = msg;
                    geoStatus.style.color = "#e74c3c";
                }
            });
        });
    }

    // ================= 6. PAYMENT & FORM SUBMISSION LOGIC =================
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // A. Validate Form
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.doctor || data.doctor.includes("(FULL)")) {
            alert("Please select an available doctor.");
            return;
        }

        // B. Get Fee Amount (Remove "₹" symbol)
        const feeText = feeDisplay.textContent; 
        const amount = parseInt(feeText.replace('Consultation Fee: ₹', ''));

        if (amount === 0) {
            alert("Consultation fee cannot be 0.");
            return;
        }

        // C. Create Razorpay Order
        try {
            const response = await fetch('http://localhost:3000/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount })
            });
            const order = await response.json();

            // D. Razorpay Checkout Options
            const options = {
                "key": "rzp_test_S9NYpv2q8uAEtK", // <--- REPLACE THIS with your actual Test Key ID
                "amount": order.amount,
                "currency": "INR",
                "name": "CarePoint Hospital",
                "description": "Consultation Fee",
                "order_id": order.id, 
                "handler": async function (response) {
                    // E. Payment Success! Now Save Appointment
                    data.paymentStatus = 'paid';
                    data.transactionId = response.razorpay_payment_id;
                    data.amount = amount;

                    const saveResult = await saveAppointment(data);
                    
                    if (saveResult) {
                        alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}\nAppointment Booked.`);
                        bookingForm.reset();
                        window.location.href = "home.html"; // Redirect to home
                    }
                },
                "prefill": {
                    "name": data.name,
                    "email": data.email,
                    "contact": data.phone
                },
                "theme": {
                    "color": "#3498db"
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Could not initiate payment. Please try again.");
        }
    });
});