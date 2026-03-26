// Scheduler - Online Version (Google Sheets)
// Scheduler - Online Version (Google Sheets)
const SHEET_ID = '17cKxYPpqYT5AzzynZ4fdmx-bmtYNKwpn6R6dfb-GAQU'; // Replace with your Google Sheet ID
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwXjJNP2EDhIRwrvmEsdfRzcA5NyIlkeR3IG7KhHJXiFdo_TlJDTNCvFwRW8gIpKW43/exec'; // Replace with deployed GAS Web App URL

const SCHEDULE_SHEET = 'Schedule';
const BOOKINGS_SHEET = 'Bookings';

async function fetchProxy(action, sheetName, data = null) {
  const params = new URLSearchParams({ action, sheet: sheetName });
  const url = `${GAS_URL}?${params}`;
  
  const options = {
    method: 'GET',
    ...(data && { method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  };
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = text.trim() === 'OK' ? 'OK' : null;
    }
    if (result?.error) throw new Error(result.error);
    return action === 'GET' ? result : result === 'OK';
  } catch (error) {
    console.error('API Error:', error);
    showToast('Online sync failed - local fallback active', 'warning');
    return null;
  }
}

const SCHEDULE_KEY = 'scheduler_slots';
const BOOKINGS_KEY = 'scheduler_bookings';
let selectedSlot = null;
let isAdmin = false;

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// ===== CLIENT FUNCTIONS =====
async function loadSchedule() {
    // Show loading
    const container = document.getElementById('schedule-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading schedule...</div>';
    
    // Try online first
    const schedule = await fetchProxy('GET', SCHEDULE_SHEET) || JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
    const bookings = await fetchProxy('GET', BOOKINGS_SHEET) || JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
    
    // Cache locally
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    document.getElementById('booking-form').style.display = 'none';
    document.getElementById('confirmation').style.display = 'none';
    
    if (schedule.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>No schedule available. Contact admin to set up time slots.</p></div>';
        return;
    }
    
    let html = '';
    schedule.forEach(time => {
        const isBooked = bookings[time];
        const slotClass = isBooked ? 'booked' : 'available';
        html += `<div class="time-slot ${slotClass}" onclick="${isBooked ? '' : `selectSlot('${time.replace(/'/g, "\\'")}')`}" style="cursor: ${isBooked ? 'not-allowed' : 'pointer'};">
                    <span>🕒 ${time}</span>
                    <span>${isBooked ? 'Booked: ' + bookings[time] : 'Available'}</span>
                 </div>`;
    });
    container.innerHTML = html;
    showToast('Schedule loaded!');
}

function selectSlot(time) {
    selectedSlot = time;
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('selected-slot-display').textContent = `Selected: ${time}`;
    document.getElementById('schedule-container').scrollIntoView({ behavior: 'smooth' });
}

async function submitBooking() {
    const name = document.getElementById('client-name').value.trim();
    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }
    if (!selectedSlot) {
        showToast('Please select a time slot', 'error');
        return;
    }
    
    let bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
    if (bookings[selectedSlot]) {
        showToast('This slot is already booked!', 'error');
        return;
    }
    
    bookings[selectedSlot] = name;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    // Sync to Sheets
    await fetchProxy('POST', BOOKINGS_SHEET, JSON.stringify(bookings));
    
    document.getElementById('client-name').value = '';
    document.getElementById('confirm-msg').textContent = `Booked ${selectedSlot} for ${name}!`;
    document.getElementById('confirmation').style.display = 'block';
    document.getElementById('booking-form').style.display = 'none';
    
    showToast('Booking confirmed online!');
    await loadSchedule();
}

// ===== ADMIN FUNCTIONS =====

    if (password === '80BA3F306F97') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        isAdmin = true;
        showView('view-admin');
        loadAdminSchedule();
        showToast('Admin login successful');
        document.getElementById('admin-password').value = '';
    } else {
        document.getElementById('admin-login-error').style.display = 'block';
        setTimeout(() => document.getElementById('admin-login-error').style.display = 'none', 3000);
    }


function adminLogout() {
    isAdmin = false;
    sessionStorage.removeItem('adminLoggedIn');
    showView('view-client');
}

async function loadAdminSchedule() {
    const list = document.getElementById('slot-list');
    list.innerHTML = '<li class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</li>';
    
    const schedule = await fetchProxy('GET', SCHEDULE_SHEET) || JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
    const bookings = await fetchProxy('GET', BOOKINGS_SHEET) || JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
    
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    if (schedule.length === 0) {
        list.innerHTML = '<li class="empty-state"><i class="fas fa-plus"></i> No slots - add some above!</li>';
        return;
    }
    
    let html = '';
    schedule.forEach(time => {
        const isBooked = bookings[time];
        html += `
            <li class="time-slot ${isBooked ? 'booked' : 'available'}">
                <span>🕒 ${time} ${isBooked ? `(Booked: ${bookings[time]})` : '(Available)'}</span>
                <button class="action-btn btn-danger btn-small" onclick="removeSlot('${time.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
    });
    list.innerHTML = html;
}

async function addSlot() {
    const rangeStr = document.getElementById('new-slot').value.trim();
    const period = document.getElementById('period').value;
    
    if (!rangeStr) {
        showToast('Enter time range (e.g. 9:00 - 10:30)', 'error');
        return;
    }
    
    const slotKey = `${rangeStr} ${period}`;
    let schedule = JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
    
    if (schedule.includes(slotKey)) {
        showToast('Slot already exists!', 'error');
        return;
    }
    
    schedule.push(slotKey);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    
    // Sync to Sheets
    await fetchProxy('POST', SCHEDULE_SHEET, JSON.stringify(schedule));
    
    document.getElementById('new-slot').value = '';
    await loadAdminSchedule();
    showMessage('Slot added online!');
}

async function removeSlot(time) {
    if (!confirm(`Remove ${time}? This clears any booking.`)) return;
    
    let schedule = JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || [];
    let bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
    
    schedule = schedule.filter(t => t !== time);
    delete bookings[time];
    
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    // Sync to Sheets
    await fetchProxy('POST', SCHEDULE_SHEET, JSON.stringify(schedule));
    await fetchProxy('POST', BOOKINGS_SHEET, JSON.stringify(bookings));
    
    await loadAdminSchedule();
    showMessage('Slot removed online!');
}

function saveSchedule() {
    showMessage('Schedule saved! (Auto-saves)');
}

async function resetBookings() {
    if (confirm('Reset ALL bookings? Schedule stays.')) {
        const emptyBookings = {};
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(emptyBookings));
        
        // Sync to Sheets
        await fetchProxy('POST', BOOKINGS_SHEET, JSON.stringify(emptyBookings));
        
        await loadAdminSchedule();
        showMessage('Bookings reset online!');
    }
}

function showMessage(msg) {
    const msgEl = document.getElementById('admin-message');
    msgEl.textContent = msg;
    msgEl.style.display = 'block';
    setTimeout(() => msgEl.style.display = 'none', 3000);
}

// Init for client view
document.addEventListener('DOMContentLoaded', async function() {
    if (sessionStorage.getItem('adminLoggedIn') && document.getElementById('view-admin')) {
        isAdmin = true;
        showView('view-admin');
        await loadAdminSchedule();
    } else {
        await loadSchedule();
    }
});

