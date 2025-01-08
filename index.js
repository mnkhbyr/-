const container = document.querySelector('.main-container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const searchInput = document.querySelector('.search-box input');
const errorMessage = document.querySelector('.not-found .message');

// API Key
const APIKey = '7918234233987e3ac5fc0b97d0f5d295';

// Function to fetch weather by coordinates
function fetchWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch weather');
            return response.json();
        })
        .then(displayWeather)
        .catch(err => {
            console.error('Error fetching weather:', err);
            showError('Unable to fetch weather data.');
        });
}

// Function to fetch 3-day forecast by coordinates
function fetchForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch forecast');
            return response.json();
        })
        .then(displayForecast)
        .catch(err => {
            console.error('Error fetching forecast:', err);
            showError('Unable to fetch forecast data.');
        });
}

// Map weather conditions to your custom image files
const weatherIcons = {
    Clear: 'images/clear.png',
    Rain: 'images/rain.png',
    Snow: 'images/snow.png',
    Clouds: 'images/cloud.png',
    Haze: 'images/mist.png',
};

// Function to display current weather
function displayWeather(data) {
    if (data.cod === '404') {
        showError('Invalid location.');
        return;
    }

    // Hide error and display weather details
    error404.style.display = 'none';
    weatherBox.style.display = 'block';
    weatherDetails.style.display = 'block';

    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.temperature');
    const description = document.querySelector('.description');
    const humidity = document.querySelector('.humidity span');
    const wind = document.querySelector('.wind span');

    // Set the weather icon based on the condition
    const weatherCondition = data.weather[0].main;
    image.src = weatherIcons[weatherCondition] || 'images/clear.png'; // Fallback to clear.png if no match

    // Update weather details
    temperature.innerHTML = `${Math.round(data.main.temp)}<span>°C</span>`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed)} Км/Цаг`;
}

// Function to display 3-day forecast
function displayForecast(data) {
    const forecastDays = {};

    data.list.forEach(item => {
        const date = new Date(item.dt_txt).toDateString();
        if (!forecastDays[date]) {
            forecastDays[date] = {
                temp: item.main.temp,
                condition: item.weather[0].main, // Get the main weather condition
            };
        }
    });

    Object.keys(forecastDays)
        .slice(0, 3)
        .forEach((date, index) => {
            const dayElement = document.getElementById(`day-${index + 1}`);
            const { temp, condition } = forecastDays[date];

            dayElement.querySelector('.date').textContent = date;
            dayElement.querySelector('img').src = weatherIcons[condition] || 'images/clear.png'; // Set custom icon
            dayElement.querySelector('.temp').textContent = `${Math.round(temp)}°C`;
        });
}


// Function to show error
function showError(message) {
    error404.style.display = 'block';
    errorMessage.textContent = message;
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
}

// Fetch location
function fetchLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const { latitude, longitude } = coords;
            fetchWeatherByCoordinates(latitude, longitude);
            fetchForecast(latitude, longitude);
        }, () => {
            alert('Байршилыг тогтоох боломжгүй байна, Гараар байршилыг оруулна уу.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Handle manual search
search.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value;
    if (!city) return;

    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);

            // Fetch 3-day forecast using the coordinates from the current weather data
            if (data.coord) {
                fetchForecast(data.coord.lat, data.coord.lon);
            }
        })
        .catch(err => {
            console.error('Error fetching weather:', err);
            showError('Unable to fetch weather data.');
        });
});

// Handle Enter key
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') search.click();
});

// Trigger location fetch on load
window.onload = fetchLocation;
