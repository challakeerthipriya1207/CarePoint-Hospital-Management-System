document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Translations Object
    const translations = {
        en: { 
            admin_title: "Staff Management Console", label_status: "Status", label_date: "Search by Date", label_blood: "Search by Blood Group",
            status_pending: "🟡 Pending Requests", status_confirmed: "🟢 Confirmed Appointments", status_cancelled: "🔴 Cancelled/Closed",
            col_priority: "Priority", col_patient: "Patient Details", col_date: "Appt. Date", col_team: "Medical Team", col_address: "Address", col_action: "Change Status"
        },
        hi: { 
            admin_title: "कर्मचारी प्रबंधन कंसोल", label_status: "स्थिति", label_date: "तिथि खोजें", label_blood: "रक्त समूह",
            status_pending: "🟡 लंबित अनुरोध", status_confirmed: "🟢 पुष्ट नियुक्तियां", status_cancelled: "🔴 रद्द/बंद",
            col_priority: "प्राथमिकता", col_patient: "रोगी विवरण", col_date: "तारीख", col_team: "मेडिकल टीम", col_address: "पता", col_action: "कार्रवाई"
        },
        te: { 
            admin_title: "సిబ్బంది నిర్వహణ కన్సోల్", label_status: "స్థితి", label_date: "తేదీ సెర్చ్", label_blood: "బ్లడ్ గ్రూప్",
            status_pending: "🟡 పెండింగ్ అభ్యర్థనలు", status_confirmed: "🟢 ఖరారు చేసిన అపాయింట్‌మెంట్‌లు", status_cancelled: "🔴 రద్దు చేయబడింది",
            col_priority: "ప్రాధాన్యత", col_patient: "రోగి వివరాలు", col_date: "తేదీ", col_team: "వైద్య బృందం", col_address: "చిరునామా", col_action: "చర్య"
        }
    };

    // 2. Async Render Table Logic
    const renderTable = async () => {
        // AWAIT the data from the MySQL Server (via storage.js)
        let list = await getAppointments(); 

        const selectedStatus = document.getElementById('statusMainFilter').value;
        const dSearch = document.getElementById('dateSearch').value;
        const bFilter = document.getElementById('bloodFilter').value;

        // SEGREGATION: Show only data for the selected Status
        list = list.filter(app => (app.status || 'pending') === selectedStatus);

        // SECONDARY FILTERS: Date and Blood Group
        // Note: MySQL returns keys as 'appointment_date' and 'blood_group' (snake_case)
        if (dSearch) list = list.filter(a => a.appointment_date && a.appointment_date.startsWith(dSearch));
        if (bFilter) list = list.filter(a => a.blood_group === bFilter);

        // TRIAGE SORT: High severity first
        const rank = { "High": 1, "Medium": 2, "Low": 3 };
        list.sort((a, b) => rank[a.severity] - rank[b.severity]);

        const tbody = document.getElementById('appointmentTableBody');
        
        // Handle Empty State
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No ${selectedStatus} appointments found matching these filters.</td></tr>`;
            return;
        }

        // Generate Table Rows
        tbody.innerHTML = list.map(app => `
            <tr class="row-${app.severity}">
                <td><span class="badge ${app.severity}">${app.severity}</span></td>
                <td>
                    <strong>${app.name}</strong><br>
                    <small>${app.phone} | ${app.blood_group}</small>
                </td>
                <td>${new Date(app.appointment_date).toLocaleDateString()}</td>
                <td>${app.doctor}</td>
                <td><small>${app.address || 'N/A'}</small></td>
                <td>
                    <select class="action-select" onchange="handleStatusUpdate(${app.id}, this.value)">
                        <option value="pending" ${app.status==='pending'?'selected':''}>Move to Pending</option>
                        <option value="confirmed" ${app.status==='confirmed'?'selected':''}>Move to Confirmed</option>
                        <option value="cancelled" ${app.status==='cancelled'?'selected':''}>Move to Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    };

    // 3. Status Update Handler (Async)
    window.handleStatusUpdate = async (id, status) => {
        await updateAppointmentStatus(id, status); // Wait for server to update
        renderTable(); // Refresh table to move record to correct view
    };

    // 4. Accessibility: Dark/Light Theme Toggle
    const themeBtn = document.getElementById('darkModeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeIcon.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('hospital_theme', isDark ? 'dark' : 'light');
    });

    // Check saved theme on load
    if (localStorage.getItem('hospital_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '🌙';
    }

    // 5. Accessibility: Language Switcher
    document.getElementById('langSelect').addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        renderTable(); // Refresh table to update dropdown text
    });

    // 6. UI Event Listeners
    document.getElementById('statusMainFilter').addEventListener('change', renderTable);
    document.getElementById('dateSearch').addEventListener('change', renderTable);
    document.getElementById('bloodFilter').addEventListener('change', renderTable);

    // Initial Load
    renderTable();
});