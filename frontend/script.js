

function updateStats() {
    const stats = [
        { number: Math.floor(Math.random() * 50) + 200, label: 'Food Resources' },
        { number: 52, label: 'Communities Served' },
        { number: Math.floor(Math.random() * 100) + 1800, label: 'People Helped' }
    ];
    
    document.querySelectorAll('.stat-number').forEach((el, index) => {
        el.textContent = stats[index].number;
    });
}

// Update stats every 30 seconds during demo
setInterval(updateStats, 30000);



// Setting the Legends part of the Map
const legendToggle = document.getElementById('legendToggle');
const legendContainer = document.getElementById('legendContainer');
const chevronIcon = document.getElementById('chevronIcon');

let isLegendVisible = false;

// Legend toggle functionality
legendToggle.addEventListener('click', function() {
    isLegendVisible = !isLegendVisible;
    
    if (isLegendVisible) {
        legendContainer.classList.add('visible');
        chevronIcon.classList.add('rotated');
    } else {
        legendContainer.classList.remove('visible');
        chevronIcon.classList.remove('rotated');
    }
});

// Optional: Add keyboard accessibility
legendToggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        legendToggle.click();
    }
});



// Enhanced Map Functionality
let map;
let markers = [];
let userLocation = null;
let infoWindow;

// Real NL food resource locations
const nlFoodResources = [
    {
        id: 1,
        name: "Salvation Army Food Bank",
        address: "25 Springdale St, St. John's, NL",
        lat: 47.5615,
        lng: -52.7126,
        type: "food-bank",
        phone: "(709) 579-3919",
        hours: "Mon-Fri 9AM-5PM",
        services: ["Groceries", "Fresh Produce", "Personal Care Items"],
        status: "open"
    },
    {
        id: 2,
        name: "Memorial University Community Fridge",
        address: "Memorial University, St. John's, NL",
        lat: 47.5726,
        lng: -52.7350,
        type: "community-fridge",
        phone: "(709) 8115-6557",
        hours: "24/7",
        services: ["Fresh Food", "Take What You Need"],
        status: "open"
    },
    {
        id: 3,
        name: "The Gathering Place",
        address: "107 Cookstown Rd, St. John's, NL",
        lat: 47.5665,
        lng: -52.7313,
        type: "soup-kitchen",
        phone: "(709) 738-1965",
        hours: "Daily Meals Available",
        services: ["Hot Meals", "Community Support", "Drop-in Services"],
        status: "open"
    },
    {
        id: 4,
        name: "St. Vincent de Paul Food Bank",
        address: "16 Church Hill, St. John's, NL",
        lat: 47.5638,
        lng: -52.7082,
        type: "food-bank",
        phone: "(709) 754-2677",
        hours: "Tue/Thu 10AM-2PM",
        services: ["Groceries", "Emergency Assistance"],
        status: "open"
    },
    {
        id: 5,
        name: "Corner Brook Food Bank",
        address: "45 West St, Corner Brook, NL",
        lat: 48.9579,
        lng: -57.9524,
        type: "food-bank",
        phone: "(709) 634-1234",
        hours: "Wed/Fri 1PM-4PM",
        services: ["Food Hampers", "Holiday Programs"],
        status: "open"
    },
    {
        id: 6,
        name: "Downtown Community Fridge",
        address: "Water St, St. John's, NL",
        lat: 47.5634,
        lng: -52.7073,
        type: "community-fridge",
        phone: "(709) 767-1829",
        hours: "24/7",
        services: ["Community Maintained", "Anonymous Access"],
        status: "open"
    }
];

// Initialize Google Map
function initMap() {
    // Default to St. John's
    const stJohns = { lat: 47.5615, lng: -52.7126 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: stJohns,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    infoWindow = new google.maps.InfoWindow();
    
    // Add markers for all resources
    addMarkers();
    
    // Try to get user's location
    getUserLocation();
    
    // Update stats
    updateMapStats();
}

function addMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    const filter = (!document.getElementById('resourceFilter').value)
        ? 'all'
        : document.getElementById('resourceFilter').value;
    
    nlFoodResources.forEach(resource => {
        if (filter === 'all' || resource.type === filter) {
            const marker = new google.maps.Marker({
                position: { lat: resource.lat, lng: resource.lng },
                map: map,
                title: resource.name,
                icon: getMarkerIcon(resource.type),
                animation: google.maps.Animation.DROP
            });
            
            const infoContent = createInfoWindowContent(resource);
            
            marker.addListener("click", () => {
                infoWindow.setContent(infoContent);
                infoWindow.open(map, marker);
                
                // Add to chat
                addMessage(`📍 Selected: ${resource.name}`, true);
                setTimeout(() => {
                    addMessage(createChatResponse(resource));
                }, 500);
            });
            
            markers.push(marker);
        }
    });
    
    updateMapStats();
}

function getMarkerIcon(type) {
    const icons = {
        'food-bank': '🏪',
        'community-fridge': '❄️',
        'soup-kitchen': '🍽️',
        'emergency': '🚨'
    };
    
    return {
        url: `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="${getTypeColor(type)}" stroke="white" stroke-width="3"/>
                <text x="20" y="26" text-anchor="middle" font-size="16">${icons[type] || '📍'}</text>
            </svg>
        `)}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
    };
}

function getTypeColor(type) {
    const colors = {
        'food-bank': '#ff4757',
        'community-fridge': '#2ed573',
        'soup-kitchen': '#ffa502',
        'emergency': '#3742fa'
    };
    return colors[type] || '#666';
}

function createInfoWindowContent(resource) {
    const statusClass = resource.status === 'open' ? 'status-open' : 'status-closed';
    
    return `
        <div class="custom-info-window">
            <div class="info-title">${resource.name}</div>
            <div class="info-details">
                📍 ${resource.address}<br>
                🕒 ${resource.hours}<br>
                📞 ${resource.phone}<br>
                <strong>Services:</strong> ${resource.services.join(', ')}<br>
                <span class="info-status ${statusClass}">
                    ${resource.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                </span>
            </div>
            <button class="directions-btn" onclick="getDirections(${resource.lat}, ${resource.lng})">
                🧭 Get Directions
            </button>
        </div>
    `;
}

function createChatResponse(resource) {
    return `Here's information about <strong>${resource.name}</strong>:<br><br>
        📍 <strong>Address:</strong> ${resource.address}<br>
        🕒 <strong>Hours:</strong> ${resource.hours}<br>
        📞 <strong>Phone:</strong> ${resource.phone}<br>
        🛠️ <strong>Services:</strong> ${resource.services.join(', ')}<br><br>
        💡 <em>Click "Get Directions" on the map for navigation!</em>`;
}

function searchLocation() {
    const searchInput = document.getElementById('locationSearch');
    const location = searchInput.value.trim();
    
    if (!location) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location + ", Newfoundland and Labrador, Canada" }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(14);
            
            // Add user location marker
            if (userLocation) {
                userLocation.setMap(null);
            }
            
            userLocation = new google.maps.Marker({
                position: location,
                map: map,
                title: "Your Location",
                icon: {
                    url: `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                            <circle cx="15" cy="15" r="12" fill="#4285f4" stroke="white" stroke-width="3"/>
                            <circle cx="15" cy="15" r="4" fill="white"/>
                        </svg>
                    `)}`,
                    scaledSize: new google.maps.Size(30, 30),
                    anchor: new google.maps.Point(15, 15)
                }
            });
            
            updateMapStats();
            
        } else {
            alert("Location not found. Please try again with a more specific address.");
        }
    });
}

function filterResources() {
    addMarkers();
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                
                map.setCenter(pos);
                map.setZoom(14);
                
                userLocation = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: `data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                                <circle cx="15" cy="15" r="12" fill="#4285f4" stroke="white" stroke-width="3"/>
                                <circle cx="15" cy="15" r="4" fill="white"/>
                            </svg>
                        `)}`,
                        scaledSize: new google.maps.Size(30, 30),
                        anchor: new google.maps.Point(15, 15)
                    }
                });
                
                updateMapStats();
            },
            () => {
                // Location denied or not available
                console.log("The Location is either not accessible or available");
            }
        );
    }
}

function getDirections(lat, lng) {
    const destination = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
}

function updateMapStats() {
    const visibleCount = markers.length;
    document.getElementById('visibleResources').textContent = visibleCount;
    
    // Calculate nearest distance if user location is available
    if (userLocation && markers.length > 0) {
        let minDistance = Infinity;
        markers.forEach(marker => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                userLocation.getPosition(),
                marker.getPosition()
            );
            minDistance = Math.min(minDistance, distance);
        });
        
        const nearestKm = (minDistance / 1000).toFixed(1);
        document.getElementById('nearestDistance').textContent = `${nearestKm} km`;
    }
}

// Load Google Maps when page loads
window.onload = function() {
    const YOUR_API_KEY = 'your_google_maps_api_key_here';
    // Load Google Maps API
    if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${YOUR_API_KEY}&libraries=geometry&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }
};

const aiResponses = {
    'food banks': 'I found several food banks in NL! Here are some options:',
    'community fridges': 'Community fridges are great for 24/7 access. Here\'s what I found:',
    'soup kitchens': 'For free prepared meals, here are soup kitchens and community kitchens:',
    'emergency': 'For immediate food assistance, here are emergency resources:',
    'free meals': 'Here are places offering free meals today:',
    'affordable': 'For budget-friendly grocery shopping, consider these options:',
    'rural': 'Rural food resources can be limited, but here are some options:',
    'default': 'I can help you find food resources in NL! Let me search for relevant information.'
};

function addMessage(message, isUser = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'flex';
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}

function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('food bank')) {
        return {
            response: aiResponses['food banks'],
            resources: foodResources['food banks']
        };
    } else if (message.includes('community fridge') || message.includes('fridge')) {
        return {
            response: aiResponses['community fridges'],
            resources: foodResources['community fridges']
        };
    } else if (message.includes('soup kitchen') || message.includes('free meal') || message.includes('meal')) {
        return {
            response: aiResponses['soup kitchens'],
            resources: foodResources['soup kitchens']
        };
    } else if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
        return {
            response: aiResponses['emergency'],
            resources: foodResources['emergency help']
        };
    } else if (message.includes('rural') || message.includes('remote') || message.includes('outport')) {
        return {
            response: 'Rural communities in NL face unique challenges. Here are some options:',
            resources: [
                'Mobile food banks visit rural communities monthly',
                'Local churches often coordinate food programs',
                'Community gardens in summer months',
                'Food voucher programs through local social services',
                'Carpool networks to access urban food banks'
            ]
        };
    } else if (message.includes('affordable') || message.includes('cheap') || message.includes('budget')) {
        return {
            response: 'For budget-friendly food shopping in NL:',
            resources: [
                'No Frills - Multiple locations with lowest prices',
                'Walmart Supercentre - Price matching available',
                'Costco - Bulk buying for families',
                'Local farmers markets - Seasonal fresh produce',
                'Community Supported Agriculture (CSA) programs'
            ]
        };
    } else {
        return {
            response: 'I can help you find food resources in NL! Here are some general options:',
            resources: [
                '🏪 Food banks for groceries and essentials',
                '❄️ Community fridges for 24/7 access',
                '🍽️ Soup kitchens for prepared meals',
                '🚨 Emergency services for immediate help',
                '📞 Call 211 for personalized assistance'
            ]
        };
    }
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input and disable send button
    input.value = '';
    document.getElementById('sendBtn').disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        setTimeout(() => {
            hideTypingIndicator();
            
            let fullResponse = data.message;
            
            if (data.resources && data.resources.length > 0) {
                fullResponse += '<br><br>';
                data.resources.forEach(resource => {
                    fullResponse += `• <strong>${resource.name}</strong><br>`;
                    fullResponse += `  📍 ${resource.address}<br>`;
                    fullResponse += `  🕒 ${resource.hours}<br>`;
                    if (resource.phone !== 'N/A') {
                        fullResponse += `  📞 ${resource.phone}<br>`;
                    }
                    fullResponse += '<br>';
                });
            }
            
            fullResponse += '<br><small>💡 <em>Tip: Always call ahead to confirm hours and availability!</em></small>';
            
            addMessage(fullResponse);
            document.getElementById('sendBtn').disabled = false;
        }, 1000);
        
    } catch (error) {
        hideTypingIndicator();
        addMessage('Sorry, I\'m having trouble connecting. Please try again later.');
        document.getElementById('sendBtn').disabled = false;
    }
}

function sendQuickMessage(message) {
    document.getElementById('userInput').value = message;
    sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add click handlers for map pins
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pin').forEach(pin => {
        pin.addEventListener('click', function() {
            const title = this.getAttribute('title');
            addMessage(`📍 Selected: ${title}`, true);
            
            setTimeout(() => {
                let response = `Here's more information about ${title}:<br><br>`;
                
                if (title.includes('Food Bank')) {
                    response += '• Provides groceries and essentials<br>• Photo ID required<br>• Visit once per week<br>• Fresh produce when available<br>• Special dietary needs accommodated';
                } else if (title.includes('Community Fridge')) {
                    response += '• Available 24/7<br>• Take what you need, leave what you can<br>• Fresh and non-perishable items<br>• Located in accessible public areas<br>• Community maintained';
                } else if (title.includes('Soup Kitchen')) {
                    response += '• Free hot meals<br>• No questions asked<br>• Welcoming community environment<br>• Special dietary options available<br>• Take-away containers provided';
                } else {
                    response += '• Affordable grocery options<br>• Price matching available<br>• Accepts food vouchers<br>• Senior discounts available<br>• Local produce when possible';
                }
                
                response += '<br><br>📞 <em>Call ahead to confirm current hours and services!</em>';
                addMessage(response);
            }, 800);
        });
    });
});

// Fallback interactive map if Google Maps fails
function createFallbackMap() {
    const mapElement = document.getElementById('map');
    mapElement.innerHTML = `
        <div style="position: relative; background: linear-gradient(45deg, #e3f2fd, #f1f8e9); height: 500px; border-radius: 10px; overflow: hidden;">
            <div style="position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 5px; font-size: 12px;">
                📍 St. John's, Newfoundland and Labrador
            </div>
            
            <!-- Interactive pins -->
            <div class="interactive-pin" style="position: absolute; top: 20%; left: 30%; width: 40px; height: 40px; background: #ff4757; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" onclick="showLocationInfo('Salvation Army Food Bank', 'food-bank')">
                <span style="transform: rotate(45deg); font-size: 16px;">🏪</span>
            </div>
            
            <div class="interactive-pin" style="position: absolute; top: 40%; left: 25%; width: 40px; height: 40px; background: #2ed573; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" onclick="showLocationInfo('MUN Community Fridge', 'community-fridge')">
                <span style="transform: rotate(45deg); font-size: 16px;">❄️</span>
            </div>
            
            <div class="interactive-pin" style="position: absolute; top: 60%; left: 35%; width: 40px; height: 40px; background: #ffa502; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" onclick="showLocationInfo('The Gathering Place', 'soup-kitchen')">
                <span style="transform: rotate(45deg); font-size: 16px;">🍽️</span>
            </div>
            
            <div class="interactive-pin" style="position: absolute; top: 70%; left: 50%; width: 40px; height: 40px; background: #ff4757; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" onclick="showLocationInfo('St. Vincent de Paul', 'food-bank')">
                <span style="transform: rotate(45deg); font-size: 16px;">🏪</span>
            </div>
            
            <!-- Simulated roads -->
            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                <path d="M 0,200 Q 200,180 400,220 T 800,200" stroke="#ddd" stroke-width="8" fill="none"/>
                <path d="M 150,0 Q 170,200 160,400 T 180,500" stroke="#ddd" stroke-width="6" fill="none"/>
                <path d="M 0,350 Q 300,330 600,360 T 900,340" stroke="#ddd" stroke-width="4" fill="none"/>
            </svg>
        </div>
    `;
}

function showLocationInfo(name, type) {
    addMessage(`📍 Selected: ${name}`, true);
    
    setTimeout(() => {
        let response = `Here's information about <strong>${name}</strong>:<br><br>`;
        
        if (type === 'food-bank') {
            response += '🏪 <strong>Food Bank</strong><br>📍 St. John\'s, NL<br>🕒 Mon-Fri 9AM-5PM<br>📞 (709) 579-3919<br>🛠️ Services: Groceries, Fresh Produce, Personal Care Items';
        } else if (type === 'community-fridge') {
            response += '❄️ <strong>Community Fridge</strong><br>📍 Memorial University<br>🕒 Available 24/7<br>🛠️ Services: Fresh Food, Take What You Need';
        } else if (type === 'soup-kitchen') {
            response += '🍽️ <strong>Soup Kitchen</strong><br>📍 Cookstown Rd, St. John\'s<br>🕒 Daily Meals Available<br>📞 (709) 738-1965<br>🛠️ Services: Hot Meals, Community Support';
        }
        
        response += '<br><br>💡 <em>Click pins on the map to explore more locations!</em>';
        addMessage(response);
    }, 500);
}