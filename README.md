# 🏨 Hotel Management System - Frontend

A responsive, modern frontend for the Hotel Management System with full CRUD operations.

# Frontend Deploy URL= 

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Complete CRUD Operations**: Create, Read, Update, Delete for:
  - Rooms Management
  - Guests Management
  - Bookings Management
- **Dashboard**: Overview with statistics
- **Real-time Updates**: Automatic data refresh after operations
- **Validation**: Form validation with error messages
- **User Notifications**: Toast notifications for user feedback
- **Search Functionality**: Filter data in real-time

## Setup Instructions

### 1. Prerequisites
- Node.js backend server running 
- MongoDB database connected
- Web browser with JavaScript enabled

### 2. Configuration

Update the API endpoint in `script.js` (line 2-3):
```javascript
const API_BASE_URL = 'https//hotel-management-1-2exf.onrender.com/api'; 
const BACKEND_URL = 'https://hotel-management-1-2exf.onrender.com';      

## API Endpoints Used
* GET /api/rooms - Fetch all rooms
* POST /api/rooms - Create new room
* PUT /api/rooms/:id - Update room
* DELETE /api/rooms/:id - Delete room
* GET /api/guests - Fetch all guests
* POST /api/guests - Create new guest
* PUT /api/guests/:id - Update guest
* DELETE /api/guests/:id - Delete guest
* GET /api/bookings - Fetch all bookings
* POST /api/bookings - Create new booking
*PUT /api/bookings/:id - Update booking
*DELETE /api/bookings/:id - Delete booking

## Deployment Instructions Summary:

1. **Backend Setup**:
   - Deploy your backend to Render/Railway
   - Get the production URL
   - Ensure CORS is properly configured

2. **Frontend Configuration**:
   - Update `API_BASE_URL` in `script.js` with your production backend URL
   - Test locally with the updated URL

3. **Frontend Deployment**:
   - Choose Vercel (recommended) or GitHub Pages
   - Upload the three files
   - Get the frontend URL

4. **Final Testing**:
   - Test all CRUD operations
   - Verify responsiveness
   - Check on mobile devices

The frontend is now fully responsive with:
- Mobile-friendly navigation menu
- Responsive tables and forms
- Touch-friendly buttons
- Adaptive layout for all screen sizes
- All functionality accessible on mobile devices

All buttons are clickable with visual feedback, and the interface provides clear user guidance throughout all operations.








