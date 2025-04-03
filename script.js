// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyBrGbJ9b_S8kvV6SBa7FpKMYa37Lixt22s",
    authDomain: "smart-parking-system-b3120.firebaseapp.com",
    databaseURL: "https://smart-parking-system-b3120-default-rtdb.firebaseio.com",
    projectId: "smart-parking-system-b3120",
    storageBucket: "smart-parking-system-b3120.firebasestorage.app",
    messagingSenderId: "273497621250",
    appId: "1:273497621250:web:a17d24e5a4835e6bfd781b",
    measurementId: "G-ZTB0LWNDEL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    const parkingSlots = document.querySelectorAll('.parking-slot');
    const slotDetails = document.getElementById('slotDetails');
    const floorButtons = document.querySelectorAll('.floor-selector .btn');
    let currentFloor = 'groundFloor'; // Default floor
    
    // Initialize the parking system
    initParkingSystem();
    
    // Floor selector buttons
    floorButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            floorButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Set current floor based on button text
            currentFloor = getFloorKey(this.textContent.trim());
            updateFloorDisplay(this.textContent.trim());
            loadParkingData(currentFloor);
        });
    });
    
    // Search functionality
    const searchBtn = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-box input');
    searchBtn.addEventListener('click', function() {
        searchForSlot(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchForSlot(this.value.trim());
        }
    });
    
    function initParkingSystem() {
        // Load initial parking data
        loadParkingData(currentFloor);
        
        // Set up realtime listeners
        setupRealtimeListeners();
    }
    
    function setupRealtimeListeners() {
        // Listen for changes in parking slots
        database.ref('parkingSlots').on('value', (snapshot) => {
            const data = snapshot.val();
            updateParkingDisplay(data[currentFloor]);
            updateParkingStats(data[currentFloor]);
        });
    }
    
    function loadParkingData(floor) {
        database.ref(`parkingSlots/${floor}`).once('value').then((snapshot) => {
            const data = snapshot.val();
            updateParkingDisplay(data);
            updateParkingStats(data);
        });
    }
    
    function updateParkingDisplay(floorData) {
        parkingSlots.forEach(slot => {
            const slotNumber = slot.getAttribute('data-slot');
            const slotData = floorData[slotNumber];
            
            if (slotData) {
                // Clear all status classes
                slot.classList.remove('available', 'occupied', 'reserved');
                
                // Add the correct status class
                slot.classList.add(slotData.status);
                
                // Update slot number display
                slot.querySelector('.slot-number').textContent = slotNumber;
            }
        });
    }
    
    function updateParkingStats(floorData) {
        if (!floorData) return;
        
        const slots = Object.values(floorData);
        const totalSlots = slots.length;
        const availableSlots = slots.filter(s => s.status === 'available').length;
        const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
        const reservedSlots = slots.filter(s => s.status === 'reserved').length;
        
        // Update stats cards
        document.querySelector('.stats-card.total-slots h3').textContent = totalSlots;
        document.querySelector('.stats-card.available-slots h3').textContent = availableSlots;
        document.querySelector('.stats-card.occupied-slots h3').textContent = occupiedSlots;
        document.querySelector('.stats-card.reserved h3').textContent = reservedSlots;
    }
    
    function handleSlotClick(slot) {
        const slotNumber = slot.getAttribute('data-slot');
        const currentStatus = getSlotStatus(slot);
        
        // Update slot details panel
        updateSlotDetails(slotNumber, currentStatus);
        
        // Highlight selected slot
        parkingSlots.forEach(s => s.style.boxShadow = 'none');
        slot.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.5)';
    }
    
    function getSlotStatus(slot) {
        if (slot.classList.contains('available')) return 'available';
        if (slot.classList.contains('occupied')) return 'occupied';
        if (slot.classList.contains('reserved')) return 'reserved';
        return 'unknown';
    }
    
    function updateSlotDetails(slotNumber, status) {
        const floorName = document.querySelector('.floor-selector .btn.active').textContent.trim();
        
        let actionButton = '';
        if (status === 'available') {
            actionButton = '<button class="btn btn-success mt-2" id="reserveBtn">Reserve This Slot</button>';
        } else if (status === 'reserved') {
            actionButton = '<button class="btn btn-warning mt-2" id="cancelReserveBtn">Cancel Reservation</button>';
        }
        
        slotDetails.innerHTML = `
            <h4>Slot Details</h4>
            <p><strong>Slot Number:</strong> ${slotNumber}</p>
            <p><strong>Status:</strong> ${capitalizeFirstLetter(status)}</p>
            <p><strong>Floor:</strong> ${floorName}</p>
            ${status === 'occupied' ? '<p class="text-muted">Occupied since: 10:45 AM</p>' : actionButton}
        `;
        
        // Add event listeners to action buttons
        if (status === 'available') {
            document.getElementById('reserveBtn').addEventListener('click', () => {
                reserveSlot(slotNumber);
            });
        } else if (status === 'reserved') {
            document.getElementById('cancelReserveBtn').addEventListener('click', () => {
                cancelReservation(slotNumber);
            });
        }
    }
    
    function reserveSlot(slotNumber) {
        const floor = getFloorKey(document.querySelector('.floor-selector .btn.active').textContent.trim());
        database.ref(`parkingSlots/${floor}/${slotNumber}`).update({
            status: 'reserved',
            reservedAt: firebase.database.ServerValue.TIMESTAMP,
            reservedBy: 'user123' // Replace with actual user ID in a real app
        }).then(() => {
            console.log(`Slot ${slotNumber} reserved successfully`);
        }).catch(error => {
            console.error('Error reserving slot:', error);
        });
    }
    
    function cancelReservation(slotNumber) {
        const floor = getFloorKey(document.querySelector('.floor-selector .btn.active').textContent.trim());
        database.ref(`parkingSlots/${floor}/${slotNumber}`).update({
            status: 'available',
            reservedAt: null,
            reservedBy: null
        }).then(() => {
            console.log(`Reservation for slot ${slotNumber} canceled`);
        }).catch(error => {
            console.error('Error canceling reservation:', error);
        });
    }
    
    function getFloorKey(floorName) {
        // Convert display name to database key
        const floors = {
            'Ground Floor': 'groundFloor',
            'First Floor': 'firstFloor',
            'Second Floor': 'secondFloor',
            'Third Floor': 'thirdFloor'
        };
        return floors[floorName] || 'groundFloor';
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function searchForSlot(slotNumber) {
        if (!slotNumber) return;
        
        const slot = document.querySelector(`.parking-slot[data-slot="${slotNumber.toUpperCase()}"]`);
        if (slot) {
            slot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            slot.style.animation = 'pulse 0.5s 2';
            setTimeout(() => {
                slot.style.animation = '';
            }, 1000);
            
            // Show slot details
            handleSlotClick(slot);
        } else {
            alert(`Slot ${slotNumber} not found!`);
        }
    }
    
    function updateFloorDisplay(floorName) {
        document.querySelector('.parking-lot h3').textContent = `${floorName} Parking`;
    }
    
    // Add click handlers to all parking slots
    parkingSlots.forEach(slot => {
        slot.addEventListener('click', () => handleSlotClick(slot));
    });
});
