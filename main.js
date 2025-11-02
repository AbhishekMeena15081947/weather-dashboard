// OpenWeatherMap API configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Users need to get their own API key from openweathermap.org
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');

// Event listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Fetch weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    // Show loading state
    weatherResult.innerHTML = '<p class="loading">Loading weather data...</p>';
    
    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    }
}

// Display weather information
function displayWeather(data) {
    const { name, sys, main, weather, wind } = data;
    
    const weatherHTML = `
        <div class="weather-card">
            <h2 class="city-name">${name}, ${sys.country}</h2>
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
            </div>
            <div class="temperature">${Math.round(main.temp)}°C</div>
            <div class="description">${weather[0].description}</div>
            <div class="details">
                <div class="detail-item">
                    <span class="label">Feels Like:</span>
                    <span class="value">${Math.round(main.feels_like)}°C</span>
                </div>
                <div class="detail-item">
                    <span class="label">Humidity:</span>
                    <span class="value">${main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Wind Speed:</span>
                    <span class="value">${wind.speed} m/s</span>
                </div>
            </div>
        </div>
    `;
    
    weatherResult.innerHTML = weatherHTML;
}

// Show error message
function showError(message) {
    weatherResult.innerHTML = `<p class="error">${message}</p>`;
}
