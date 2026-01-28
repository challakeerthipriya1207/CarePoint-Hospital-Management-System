document.addEventListener('DOMContentLoaded', () => {
    // Reusing the same data structure from booking.js for consistency
     const medicalData = {
        "Cardiology": ["Dr. Gupta | MBBS, MS, M.Ch (Cardio) | 15 Yrs Exp", "Dr. Iyer | MBBS, MD | 10 Yrs Exp"], 
        "Neurology":  ["Dr. Khan | MBBS, MD, DM (Neuro) | 20 Yrs Exp", "Dr. Singh | MBBS, MD | 9 Yrs Exp"], 
        "Dermatology": ["Dr. Kapoor | MBBS, DDVL (Skin) | 11 Yrs Exp", "Dr. Malhotra | MBBS, MD | 7 Yrs Exp"], 
        "Orthopedics": ["Dr. Verma | MS (Orthopedics) | 14 Yrs Exp", "Dr. Reddy | MBBS, MS | 10 Yrs Exp"]
    };
    const container = document.getElementById('doctorsContainer');

    // Loop through the data to create cards dynamically
    for (const [dept, docs] of Object.entries(medicalData)) {
        docs.forEach(docString => {
            // Split string to get Name and Qualification
            const [name, qual] = docString.split('|');
            
            const card = document.createElement('div');
            card.className = 'doc-card';
            card.innerHTML = `
                <div class="doc-img-placeholder">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doc-info">
                    <h3>${name.trim()}</h3>
                    <div class="doc-dept">${dept}</div>
                    <div class="doc-exp">${qual ? qual.trim() : 'Specialist'}</div>
                    <button class="btn-role" style="width:100%; margin-top:10px;" onclick="window.location.href='index.html'">Book Appointment</button>
                </div>
            `;
            container.appendChild(card);
        });
    }
});