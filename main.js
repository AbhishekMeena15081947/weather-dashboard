// Open-Meteo API configuration (no API key required)
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

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

// Convert city name to coordinates using Open-Meteo Geocoding API
async function getCityCoordinates(cityName) {
    const response = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    
    if (!response.ok) {
        throw new Error('Failed to find city');
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
    }
    
    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
    };
}

// Fetch weather data from Open-Meteo
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    // Show loading state
    weatherResult.innerHTML = '<p class="loading">Loading weather data...</p>';
    
    try {
        // Step 1: Get coordinates for the city
        const location = await getCityCoordinates(city);
        
        // Step 2: Fetch weather data using coordinates
        const weatherResponse = await fetch(
            `${WEATHER_API_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData, location);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    }
}

// Get weather description from WMO weather code
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
}

// Display weather information
function displayWeather(data, location) {
    const current = data.current;
    const weatherDescription = getWeatherDescription(current.weather_code);
    
    const weatherHTML = `
        <div class="weather-card">
            <h2 class="city-name">${location.name}, ${location.country}</h2>
            <div class="temperature">${Math.round(current.temperature_2m)}°C</div>
            <div class="description">${weatherDescription}</div>
            <div class="details">
                <div class="detail-item">
                    <span class="label">Feels Like:</span>
                    <span class="value">${Math.round(current.apparent_temperature)}°C</span>
                </div>
                <div class="detail-item">
                    <span class="label">Humidity:</span>
                    <span class="value">${current.relative_humidity_2m}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Wind Speed:</span>
                    <span class="value">${current.wind_speed_10m} km/h</span>
                </div>
                <div class="detail-item">
                    <span class="label">Precipitation:</span>
                    <span class="value">${current.precipitation} mm</span>
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
