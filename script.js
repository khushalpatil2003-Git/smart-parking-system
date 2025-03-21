// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



// References to the parking slots in Firebase
const slot1Ref = database.ref('/parking/slot1');
const slot2Ref = database.ref('/parking/slot2');

// Chart.js setup
const ctx = document.getElementById('parkingChart').getContext('2d');
const parkingChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Slot 1', 'Slot 2'],
    datasets: [{
      label: 'Parking Status',
      data: [0, 0],
      backgroundColor: ['#d4edda', '#f8d7da'],
      borderColor: ['#155724', '#721c24'],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1
        }
      }
    }
  }
});

// Function to update the UI
const updateSlotStatus = (slotElement, status) => {
  slotElement.innerText = status ? "Occupied" : "Available";
  slotElement.className = `slot ${status ? 'occupied' : 'available'}`;
};

// Function to update the total available slots
const updateTotalSlots = (slot1Status, slot2Status) => {
  const totalAvailable = (slot1Status ? 0 : 1) + (slot2Status ? 0 : 1);
  document.getElementById('totalSlots').innerText = `Total Available Slots: ${totalAvailable}`;
};

// Function to update the chart
const updateChart = (slot1Status, slot2Status) => {
  parkingChart.data.datasets[0].data = [slot1Status ? 1 : 0, slot2Status ? 1 : 0];
  parkingChart.update();
};

// Listen for changes in Slot 1
slot1Ref.on('value', (snapshot) => {
  const status = snapshot.val();
  const slot1Element = document.getElementById('slot1');
  updateSlotStatus(slot1Element, status);
  updateTotalSlots(status, parkingChart.data.datasets[0].data[1]);
  updateChart(status, parkingChart.data.datasets[0].data[1]);
});

// Listen for changes in Slot 2
slot2Ref.on('value', (snapshot) => {
  const status = snapshot.val();
  const slot2Element = document.getElementById('slot2');
  updateSlotStatus(slot2Element, status);
  updateTotalSlots(parkingChart.data.datasets[0].data[0], status);
  updateChart(parkingChart.data.datasets[0].data[0], status);
});

// Refresh button functionality
const refreshStatus = () => {
  slot1Ref.once('value').then((snapshot) => {
    const status = snapshot.val();
    updateSlotStatus(document.getElementById('slot1'), status);
  });
  slot2Ref.once('value').then((snapshot) => {
    const status = snapshot.val();
    updateSlotStatus(document.getElementById('slot2'), status);
  });
};

// Admin login functionality
const login = () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username === "admin" && password === "admin123") {
    alert("Login successful!");
  } else {
    alert("Invalid credentials!");
  }
};