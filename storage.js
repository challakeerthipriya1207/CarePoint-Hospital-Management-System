const API_URL = 'http://localhost:3000/api/appointments';

// 1. Fetch all appointments from MySQL
async function getAppointments() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error("Error connecting to server:", error);
        return [];
    }
}

// 2. Save a new appointment to MySQL
async function saveAppointment(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Server error');
        return await response.json(); // Returns the new ID
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Failed to save appointment. Is the server running?");
    }
}

// 3. Update status in MySQL
async function updateAppointmentStatus(id, newStatus) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (error) {
        console.error("Error updating status:", error);
    }
}