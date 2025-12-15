// Configuration
const API_BASE_URL = 'https://hotel-management-1-2exf.onrender.com/api';
const BACKEND_URL = 'https://hotel-management-1-2exf.onrender.com';

// State Management
let currentItemToDelete = null;
let deleteType = null;
let isEditing = false;

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const greetingElement = document.getElementById('greeting');
const currentDateElement = document.getElementById('currentDate');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Show loading overlay
    showLoading();
    
    // Set up current date and greeting
    updateDateTime();
    
    // Check backend connection
    await checkBackendConnection();
    
    // Load initial data
    await loadInitialData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Hide loading overlay
    hideLoading();
}

// Update date and greeting
function updateDateTime() {
    const now = new Date();
    const hour = now.getHours();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    // Set greeting based on time of day
    if (hour < 12) {
        greetingElement.textContent = 'Good Morning';
    } else if (hour < 18) {
        greetingElement.textContent = 'Good Afternoon';
    } else {
        greetingElement.textContent = 'Good Evening';
    }
    
    // Set current date
    currentDateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
}

// Check backend connection
async function checkBackendConnection() {
    const apiStatusText = document.getElementById('apiStatusText');
    const apiStatusIcon = document.getElementById('apiStatusIcon');
    
    try {
        const response = await fetch(BACKEND_URL);
        if (response.ok) {
            apiStatusText.textContent = 'Connected';
            apiStatusIcon.style.color = '#4cc9f0';
            showToast('Connected to backend API', 'success');
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        apiStatusText.textContent = 'Disconnected';
        apiStatusIcon.style.color = '#f94144';
        showToast(`Cannot connect to backend: ${error.message}`, 'error');
    }
}

// Load initial data
async function loadInitialData() {
    try {
        await Promise.all([
            loadRooms(),
            loadGuests(),
            loadBookings()
        ]);
        updateDashboard();
    } catch (error) {
        showToast('Error loading initial data', 'error');
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Quick action buttons
    document.querySelectorAll('.nav-action-btn, .action-card').forEach(button => {
        button.addEventListener('click', (e) => {
            const sectionId = button.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
                
                // Show form if it's an add action
                if (sectionId === 'rooms') {
                    showRoomForm();
                } else if (sectionId === 'guests') {
                    showGuestForm();
                } else if (sectionId === 'bookings') {
                    showBookingForm();
                }
            }
        });
    });

    // Refresh button
    document.getElementById('refreshData').addEventListener('click', async () => {
        showLoading();
        await loadInitialData();
        hideLoading();
        showToast('Data refreshed successfully', 'success');
    });

    // Rooms
    document.getElementById('showRoomForm').addEventListener('click', () => showRoomForm());
    document.getElementById('cancelRoomForm').addEventListener('click', hideRoomForm);
    document.getElementById('cancelRoomFormBtn').addEventListener('click', hideRoomForm);
    document.getElementById('roomForm').addEventListener('submit', handleRoomSubmit);
    document.getElementById('searchRooms').addEventListener('input', searchRooms);
    document.getElementById('filterAvailable').addEventListener('click', filterAvailableRooms);
    document.getElementById('exportRooms').addEventListener('click', exportRooms);

    // Guests
    document.getElementById('showGuestForm').addEventListener('click', () => showGuestForm());
    document.getElementById('cancelGuestForm').addEventListener('click', hideGuestForm);
    document.getElementById('cancelGuestFormBtn').addEventListener('click', hideGuestForm);
    document.getElementById('guestForm').addEventListener('submit', handleGuestSubmit);
    document.getElementById('searchGuests').addEventListener('input', searchGuests);
    document.getElementById('filterVIP').addEventListener('click', filterVIPGuests);

    // Bookings
    document.getElementById('showBookingForm').addEventListener('click', () => showBookingForm());
    document.getElementById('cancelBookingForm').addEventListener('click', hideBookingForm);
    document.getElementById('cancelBookingFormBtn').addEventListener('click', hideBookingForm);
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    document.getElementById('searchBookings').addEventListener('input', searchBookings);
    document.getElementById('filterToday').addEventListener('click', filterTodayBookings);
    document.getElementById('filterUpcoming').addEventListener('click', filterUpcomingBookings);

    // Check-in action
    document.getElementById('checkInAction').addEventListener('click', () => {
        showSection('bookings');
        document.querySelector('[data-section="bookings"]').classList.add('active');
        showToast('Navigate to bookings to manage check-ins', 'info');
    });

    // Delete modal
    document.getElementById('closeDeleteModal').addEventListener('click', hideDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

    // Support and Documentation
    document.getElementById('viewDocs').addEventListener('click', () => {
        showToast('Documentation will open in a new tab', 'info');
    });

    document.getElementById('supportBtn').addEventListener('click', () => {
        showToast('Support feature coming soon', 'info');
    });

    // Close modal on overlay click
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('deleteModal')) {
            hideDeleteModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            hideDeleteModal();
            hideRoomForm();
            hideGuestForm();
            hideBookingForm();
        }
        
        // Ctrl+R to refresh
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            document.getElementById('refreshData').click();
        }
    });
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 1200) {
        sidebar.classList.remove('active');
    }
}

// ===== ROOMS FUNCTIONS =====
function showRoomForm(room = null) {
    const formContainer = document.getElementById('roomFormContainer');
    const formTitle = document.getElementById('roomFormTitle');
    const submitText = document.getElementById('roomSubmitText');
    
    isEditing = !!room;
    
    if (room) {
        // Edit mode
        formTitle.textContent = 'Edit Room';
        submitText.textContent = 'Update Room';
        document.getElementById('roomId').value = room._id;
        document.getElementById('roomNumber').value = room.number;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomStatus').value = room.status;
    } else {
        // Add mode
        formTitle.textContent = 'Add New Room';
        submitText.textContent = 'Save Room';
        document.getElementById('roomForm').reset();
        document.getElementById('roomId').value = '';
    }
    
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideRoomForm() {
    document.getElementById('roomFormContainer').style.display = 'none';
    document.getElementById('roomForm').reset();
    clearRoomErrors();
    isEditing = false;
}

function clearRoomErrors() {
    document.querySelectorAll('#roomForm .form-error').forEach(el => {
        el.style.display = 'none';
    });
}

async function handleRoomSubmit(e) {
    e.preventDefault();
    
    const roomId = document.getElementById('roomId').value;
    const roomData = {
        number: parseInt(document.getElementById('roomNumber').value),
        type: document.getElementById('roomType').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        status: document.getElementById('roomStatus').value
    };
    
    // Validation
    let isValid = true;
    clearRoomErrors();
    
    if (!roomData.number || roomData.number <= 0) {
        showFormError('roomNumberError', 'Please enter a valid room number');
        isValid = false;
    }
    
    if (!roomData.type) {
        showFormError('roomType', 'Please select a room type');
        isValid = false;
    }
    
    if (!roomData.price || roomData.price <= 0) {
        showFormError('roomPrice', 'Please enter a valid price');
        isValid = false;
    }
    
    if (!isValid) return;
    
    showLoading();
    
    try {
        if (roomId) {
            // Update existing room
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            
            if (!response.ok) throw new Error('Failed to update room');
            
            showToast('Room updated successfully!', 'success');
        } else {
            // Create new room
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            
            if (!response.ok) throw new Error('Failed to create room');
            
            showToast('Room created successfully!', 'success');
        }
        
        hideRoomForm();
        await loadRooms();
        await populateRoomDropdown();
        updateDashboard();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadRooms() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const rooms = await response.json();
        
        const tableBody = document.getElementById('roomsTableBody');
        tableBody.innerHTML = '';
        
        if (rooms.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-bed fa-3x"></i>
                            <h4>No Rooms Found</h4>
                            <p>Get started by adding your first room</p>
                            <button class="btn-primary" onclick="showRoomForm()">
                                <i class="fas fa-plus"></i> Add Room
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            updateTableSummary('roomsSummary', 0);
            return;
        }
        
        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${room.number}</strong></td>
                <td>${formatRoomType(room.type)}</td>
                <td>$${room.price.toFixed(2)}</td>
                <td><span class="status-badge status-${room.status}">${room.status}</span></td>
                <td>
                    <div class="table-action-group">
                        <button class="table-action-btn edit" data-id="${room._id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-id="${room._id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.table-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const roomId = btn.getAttribute('data-id');
                const room = await getRoomById(roomId);
                if (room) showRoomForm(room);
            });
        });
        
        document.querySelectorAll('.table-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.getAttribute('data-id');
                showDeleteModal('room', roomId);
            });
        });
        
        updateTableSummary('roomsSummary', rooms.length);
        
    } catch (error) {
        document.getElementById('roomsTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading rooms: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

async function getRoomById(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const rooms = await response.json();
        return rooms.find(room => room._id === roomId);
    } catch (error) {
        showToast(`Error fetching room: ${error.message}`, 'error');
        return null;
    }
}

function searchRooms() {
    const searchTerm = document.getElementById('searchRooms').value.toLowerCase();
    const rows = document.querySelectorAll('#roomsTableBody tr');
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    updateTableSummary('roomsSummary', visibleCount);
}

function filterAvailableRooms() {
    const rows = document.querySelectorAll('#roomsTableBody tr');
    let availableCount = 0;
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge && statusBadge.textContent.includes('available')) {
            row.style.display = '';
            availableCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    updateTableSummary('roomsSummary', availableCount);
    showToast(`Showing ${availableCount} available rooms`, 'info');
}

function exportRooms() {
    showToast('Export feature coming soon', 'info');
}

// ===== GUESTS FUNCTIONS =====
function showGuestForm(guest = null) {
    const formContainer = document.getElementById('guestFormContainer');
    const formTitle = document.getElementById('guestFormTitle');
    const submitText = document.getElementById('guestSubmitText');
    
    isEditing = !!guest;
    
    if (guest) {
        // Edit mode
        formTitle.textContent = 'Edit Guest';
        submitText.textContent = 'Update Guest';
        document.getElementById('guestId').value = guest._id;
        document.getElementById('guestName').value = guest.name;
        document.getElementById('guestEmail').value = guest.email;
        document.getElementById('guestPhone').value = guest.phone;
    } else {
        // Add mode
        formTitle.textContent = 'Add New Guest';
        submitText.textContent = 'Save Guest';
        document.getElementById('guestForm').reset();
        document.getElementById('guestId').value = '';
    }
    
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideGuestForm() {
    document.getElementById('guestFormContainer').style.display = 'none';
    document.getElementById('guestForm').reset();
    clearGuestErrors();
    isEditing = false;
}

function clearGuestErrors() {
    document.querySelectorAll('#guestForm .form-error').forEach(el => {
        el.style.display = 'none';
    });
}

async function handleGuestSubmit(e) {
    e.preventDefault();
    
    const guestId = document.getElementById('guestId').value;
    const guestData = {
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        phone: document.getElementById('guestPhone').value.trim()
    };
    
    // Validation
    let isValid = true;
    clearGuestErrors();
    
    if (!guestData.name) {
        showFormError('guestNameError', 'Please enter guest name');
        isValid = false;
    }
    
    if (!guestData.email || !isValidEmail(guestData.email)) {
        showFormError('guestEmailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!guestData.phone) {
        showFormError('guestPhoneError', 'Please enter phone number');
        isValid = false;
    }
    
    if (!isValid) return;
    
    showLoading();
    
    try {
        if (guestId) {
            // Update existing guest
            const response = await fetch(`${API_BASE_URL}/guests/${guestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestData)
            });
            
            if (!response.ok) throw new Error('Failed to update guest');
            
            showToast('Guest updated successfully!', 'success');
        } else {
            // Create new guest
            const response = await fetch(`${API_BASE_URL}/guests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestData)
            });
            
            if (!response.ok) throw new Error('Failed to create guest');
            
            showToast('Guest created successfully!', 'success');
        }
        
        hideGuestForm();
        await loadGuests();
        await populateGuestDropdown();
        updateDashboard();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadGuests() {
    try {
        const response = await fetch(`${API_BASE_URL}/guests`);
        const guests = await response.json();
        
        const tableBody = document.getElementById('guestsTableBody');
        tableBody.innerHTML = '';
        
        if (guests.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-users fa-3x"></i>
                            <h4>No Guests Found</h4>
                            <p>Get started by adding your first guest</p>
                            <button class="btn-primary" onclick="showGuestForm()">
                                <i class="fas fa-user-plus"></i> Add Guest
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            updateTableSummary('guestsSummary', 0);
            return;
        }
        
        guests.forEach(guest => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="guest-info">
                        <div class="guest-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="guest-details">
                            <strong>${guest.name}</strong>
                            <small>Guest ID: ${guest._id.substring(0, 8)}</small>
                        </div>
                    </div>
                </td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td><span class="booking-count">0 bookings</span></td>
                <td>
                    <div class="table-action-group">
                        <button class="table-action-btn edit" data-id="${guest._id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-id="${guest._id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners
        document.querySelectorAll('.table-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const guestId = btn.getAttribute('data-id');
                const guest = await getGuestById(guestId);
                if (guest) showGuestForm(guest);
            });
        });
        
        document.querySelectorAll('.table-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const guestId = btn.getAttribute('data-id');
                showDeleteModal('guest', guestId);
            });
        });
        
        updateTableSummary('guestsSummary', guests.length);
        
    } catch (error) {
        document.getElementById('guestsTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading guests: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

async function getGuestById(guestId) {
    try {
        const response = await fetch(`${API_BASE_URL}/guests`);
        const guests = await response.json();
        return guests.find(guest => guest._id === guestId);
    } catch (error) {
        showToast(`Error fetching guest: ${error.message}`, 'error');
        return null;
    }
}

function searchGuests() {
    const searchTerm = document.getElementById('searchGuests').value.toLowerCase();
    const rows = document.querySelectorAll('#guestsTableBody tr');
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    updateTableSummary('guestsSummary', visibleCount);
}

function filterVIPGuests() {
    showToast('VIP guests filter coming soon', 'info');
}

// ===== BOOKINGS FUNCTIONS =====
function showBookingForm(booking = null) {
    const formContainer = document.getElementById('bookingFormContainer');
    const formTitle = document.getElementById('bookingFormTitle');
    const submitText = document.getElementById('bookingSubmitText');
    
    isEditing = !!booking;
    
    // Populate dropdowns
    populateGuestDropdown();
    populateRoomDropdown();
    
    if (booking) {
        // Edit mode
        formTitle.textContent = 'Edit Booking';
        submitText.textContent = 'Update Booking';
        document.getElementById('bookingId').value = booking._id;
        document.getElementById('bookingGuest').value = booking.guestId?._id || '';
        document.getElementById('bookingRoom').value = booking.roomId?._id || '';
        document.getElementById('checkInDate').value = formatDateForInput(booking.checkIn);
        document.getElementById('checkOutDate').value = formatDateForInput(booking.checkOut);
        document.getElementById('bookingStatus').value = booking.status;
    } else {
        // Add mode
        formTitle.textContent = 'Create New Booking';
        submitText.textContent = 'Save Booking';
        document.getElementById('bookingForm').reset();
        document.getElementById('bookingId').value = '';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('checkInDate').value = today;
        document.getElementById('checkOutDate').value = tomorrowStr;
        document.getElementById('checkInDate').min = today;
    }
    
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideBookingForm() {
    document.getElementById('bookingFormContainer').style.display = 'none';
    document.getElementById('bookingForm').reset();
    isEditing = false;
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingId = document.getElementById('bookingId').value;
    const bookingData = {
        guestId: document.getElementById('bookingGuest').value,
        roomId: document.getElementById('bookingRoom').value,
        checkIn: document.getElementById('checkInDate').value,
        checkOut: document.getElementById('checkOutDate').value,
        status: document.getElementById('bookingStatus').value
    };
    
    // Date validation
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    
    if (checkIn >= checkOut) {
        showToast('Check-out date must be after check-in date', 'error');
        return;
    }
    
    showLoading();
    
    try {
        if (bookingId) {
            // Update existing booking
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) throw new Error('Failed to update booking');
            
            showToast('Booking updated successfully!', 'success');
        } else {
            // Create new booking
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) throw new Error('Failed to create booking');
            
            showToast('Booking created successfully!', 'success');
        }
        
        hideBookingForm();
        await loadBookings();
        updateDashboard();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const bookings = await response.json();
        
        const tableBody = document.getElementById('bookingsTableBody');
        tableBody.innerHTML = '';
        
        if (bookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-calendar fa-3x"></i>
                            <h4>No Bookings Found</h4>
                            <p>Get started by creating your first booking</p>
                            <button class="btn-primary" onclick="showBookingForm()">
                                <i class="fas fa-calendar-plus"></i> Create Booking
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            updateTableSummary('bookingsSummary', 0);
            return;
        }
        
        bookings.forEach(booking => {
            const checkIn = new Date(booking.checkIn).toLocaleDateString();
            const checkOut = new Date(booking.checkOut).toLocaleDateString();
            const status = booking.status || 'booked';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.guestId?.name || 'N/A'}</td>
                <td><strong>Room ${booking.roomId?.number || 'N/A'}</strong></td>
                <td>${checkIn}</td>
                <td>${checkOut}</td>
                <td><span class="status-badge status-${status}">${status}</span></td>
                <td>
                    <div class="table-action-group">
                        <button class="table-action-btn edit" data-id="${booking._id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn delete" data-id="${booking._id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${status === 'booked' ? `
                            <button class="table-action-btn check-in" data-id="${booking._id}" title="Check-in">
                                <i class="fas fa-sign-in-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners
        document.querySelectorAll('.table-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const bookingId = btn.getAttribute('data-id');
                const booking = await getBookingById(bookingId);
                if (booking) showBookingForm(booking);
            });
        });
        
        document.querySelectorAll('.table-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.getAttribute('data-id');
                showDeleteModal('booking', bookingId);
            });
        });
        
        document.querySelectorAll('.table-action-btn.check-in').forEach(btn => {
            btn.addEventListener('click', async () => {
                const bookingId = btn.getAttribute('data-id');
                await checkInBooking(bookingId);
            });
        });
        
        updateTableSummary('bookingsSummary', bookings.length);
        
    } catch (error) {
        document.getElementById('bookingsTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading bookings: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

async function getBookingById(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const bookings = await response.json();
        return bookings.find(booking => booking._id === bookingId);
    } catch (error) {
        showToast(`Error fetching booking: ${error.message}`, 'error');
        return null;
    }
}

async function checkInBooking(bookingId) {
    showLoading();
    try {
        const booking = await getBookingById(bookingId);
        if (booking) {
            const updatedBooking = { ...booking, status: 'checked-in' };
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBooking)
            });
            
            if (response.ok) {
                showToast('Guest checked in successfully!', 'success');
                await loadBookings();
                await loadRooms();
                updateDashboard();
            }
        }
    } catch (error) {
        showToast(`Error checking in: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function searchBookings() {
    const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
    const rows = document.querySelectorAll('#bookingsTableBody tr');
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    updateTableSummary('bookingsSummary', visibleCount);
}

function filterTodayBookings() {
    const today = new Date().toDateString();
    const rows = document.querySelectorAll('#bookingsTableBody tr');
    let todayCount = 0;
    
    rows.forEach(row => {
        const dateCell = row.cells[2]; // Check-in date cell
        if (dateCell && new Date(dateCell.textContent).toDateString() === today) {
            row.style.display = '';
            todayCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    updateTableSummary('bookingsSummary', todayCount);
    showToast(`Showing ${todayCount} bookings for today`, 'info');
}

function filterUpcomingBookings() {
    const today = new Date();
    const rows = document.querySelectorAll('#bookingsTableBody tr');
    let upcomingCount = 0;
    
    rows.forEach(row => {
        const dateCell = row.cells[2]; // Check-in date cell
        if (dateCell) {
            const checkInDate = new Date(dateCell.textContent);
            if (checkInDate > today) {
                row.style.display = '';
                upcomingCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    updateTableSummary('bookingsSummary', upcomingCount);
    showToast(`Showing ${upcomingCount} upcoming bookings`, 'info');
}

// ===== DROPDOWN POPULATION =====
async function populateGuestDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/guests`);
        const guests = await response.json();
        const dropdown = document.getElementById('bookingGuest');
        
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest._id;
            option.textContent = `${guest.name} (${guest.email})`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading guests for dropdown:', error);
    }
}

async function populateRoomDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        const rooms = await response.json();
        const dropdown = document.getElementById('bookingRoom');
        
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        rooms.forEach(room => {
            if (room.status === 'available') {
                const option = document.createElement('option');
                option.value = room._id;
                option.textContent = `Room ${room.number} - ${formatRoomType(room.type)} ($${room.price})`;
                dropdown.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading rooms for dropdown:', error);
    }
}

// ===== DASHBOARD FUNCTIONS =====
async function updateDashboard() {
    try {
        const [roomsRes, guestsRes, bookingsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/rooms`),
            fetch(`${API_BASE_URL}/guests`),
            fetch(`${API_BASE_URL}/bookings`)
        ]);
        
        const rooms = await roomsRes.json();
        const guests = await guestsRes.json();
        const bookings = await bookingsRes.json();
        
        // Update counts
        document.getElementById('roomsCount').textContent = rooms.length;
        document.getElementById('guestsCount').textContent = guests.length;
        
        const activeBookings = bookings.filter(b => 
            b.status === 'booked' || b.status === 'checked-in'
        ).length;
        document.getElementById('bookingsCount').textContent = activeBookings;
        
        // Calculate today's revenue
        const today = new Date().toDateString();
        let revenue = 0;
        
        bookings.forEach(booking => {
            const checkIn = new Date(booking.checkIn).toDateString();
            const checkOut = new Date(booking.checkOut).toDateString();
            
            if (booking.status === 'checked-in' && 
                today >= checkIn && 
                today <= checkOut &&
                booking.roomId) {
                // Assuming each booking has totalPrice, otherwise calculate from room price
                if (booking.totalPrice) {
                    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
                    revenue += booking.totalPrice / nights;
                } else if (booking.roomId.price) {
                    revenue += booking.roomId.price;
                }
            }
        });
        
        document.getElementById('revenue').textContent = `$${revenue.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// ===== DELETE MODAL FUNCTIONS =====
function showDeleteModal(type, id) {
    deleteType = type;
    currentItemToDelete = id;
    
    const modal = document.getElementById('deleteModal');
    const message = document.getElementById('deleteMessage');
    
    let itemName = '';
    switch(type) {
        case 'room':
            itemName = 'room';
            message.textContent = 'This will permanently remove the room from your inventory.';
            break;
        case 'guest':
            itemName = 'guest';
            message.textContent = 'This will permanently remove the guest and all their bookings.';
            break;
        case 'booking':
            itemName = 'booking';
            message.textContent = 'This will permanently remove the booking record.';
            break;
    }
    
    modal.style.display = 'flex';
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
    currentItemToDelete = null;
    deleteType = null;
}

async function confirmDelete() {
    if (!currentItemToDelete || !deleteType) return;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/${deleteType}s/${currentItemToDelete}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete');
        
        showToast(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully!`, 'success');
        
        // Reload relevant data
        switch(deleteType) {
            case 'room':
                await loadRooms();
                await populateRoomDropdown();
                break;
            case 'guest':
                await loadGuests();
                await populateGuestDropdown();
                break;
            case 'booking':
                await loadBookings();
                break;
        }
        
        await updateDashboard();
        hideDeleteModal();
    } catch (error) {
        showToast(`Error deleting ${deleteType}: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// ===== UTILITY FUNCTIONS =====
function showFormError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function formatRoomType(type) {
    const types = {
        'single': 'Single Room',
        'double': 'Double Room',
        'deluxe': 'Deluxe Suite',
        'suite': 'Executive Suite'
    };
    return types[type] || type;
}

function updateTableSummary(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `Showing ${count} items`;
    }
}

// ===== TOAST SYSTEM =====
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        </div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toast.remove();
        }
    }, duration);
}

// ===== LOADING OVERLAY =====
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// ===== EMPTY STATES =====
// Add CSS for empty states
const emptyStateCSS = `
.empty-state {
    padding: 4rem 2rem !important;
    text-align: center;
}

.empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--text-tertiary);
}

.empty-state-content i {
    color: var(--border-color);
}

.empty-state-content h4 {
    color: var(--text-secondary);
    margin: 0;
}

.empty-state-content p {
    margin: 0;
    max-width: 300px;
}

.error-state {
    padding: 3rem 2rem !important;
    text-align: center;
    color: var(--danger-color);
}

.error-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.error-state p {
    margin: 0;
}

.guest-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.guest-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--hover-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
}

.guest-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.guest-details small {
    color: var(--text-tertiary);
    font-size: 0.8rem;
}

.booking-count {
    padding: 4px 12px;
    background: var(--hover-color);
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    color: var(--text-secondary);
}
`;

// Add empty state styles to document
const style = document.createElement('style');
style.textContent = emptyStateCSS;
document.head.appendChild(style);