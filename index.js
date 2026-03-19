// Live Weather Forecast using Open-Meteo API (free, no API key needed)

async function getForecast() {
    const city = document.getElementById("cityInput").value.trim();
    const resultDiv = document.getElementById("forecastResult");
    const btn = document.getElementById("forecastBtn");

    if (!city) {
        resultDiv.innerHTML = '<div class="forecast-card"><p style="color: #ff6b6b;">❌ Please enter a city name</p></div>';
        return;
    }

    btn.textContent = "⏳ Loading Forecast...";
    btn.disabled = true;
    resultDiv.innerHTML = '<div class="forecast-card current"><p>🔄 Fetching weather data...</p></div>';

    try {
        // Step 1: Geocode city to lat/lon using Nominatim (free)
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error("City not found");
        }

        const { lat, lon } = geoData[0];

        // Step 2: Get weather forecast from Open-Meteo
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) {
            throw new Error("Weather data unavailable");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current_weather;
        const daily = weatherData.daily;

        // Weather code mapping
        const weatherCodes = {
            0: '☀️ Clear sky',
            1: '🌤️ Mainly clear',
            2: '⛅ Partly cloudy',
            3: '☁️ Overcast',
            45: '🌫 Fog',
            48: '🌫 Fog',
            51: '🌦 Drizzle',
            53: '🌦 Drizzle',
            55: '🌦 Drizzle',
            61: '🌧 Light rain',
            63: '🌧 Rain',
            65: '🌧 Heavy rain',
            80: '🌦 Showers',
            95: '⛈ Thunderstorm'
        };

        // Render current + 5-day forecast
        let html = `
            <div class="forecast-card current">
                <h2>Current Weather in ${city}</h2>
                <div class="weather-icon">${getWeatherIcon(current.weathercode)}</div>
                <div class="temp">${current.temperature}°C</div>
                <p class="condition">${weatherCodes[current.weathercode] || 'Unknown'}</p>
                <p><strong>Wind:</strong> ${current.windspeed} km/h</p>
            </div>
        `;

        // 5-day forecast
        for (let i = 0; i < 5; i++) {
            const date = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const code = daily.weathercode[i];
            html += `
                <div class="forecast-card">
                    <h3>${date}</h3>
                    <div class="weather-icon">${getWeatherIcon(code)}</div>
                    <div class="temp">H: ${daily.temperature_2m_max[i]}°C L: ${daily.temperature_2m_min[i]}°C</div>
                    <p class="condition">${weatherCodes[code] || 'Unknown'}</p>
                </div>
            `;
        }

        resultDiv.innerHTML = html;

    } catch (error) {
        resultDiv.innerHTML = `<div class="forecast-card current"><p style="color: #ff6b6b;">❌ ${error.message}</p></div>`;
    } finally {
        btn.textContent = "Get 5-Day Forecast";
        btn.disabled = false;
    }
}

function getWeatherIcon(code) {
    const icons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌦', 53: '🌦', 55: '🌦',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        80: '🌦', 95: '⛈️'
    };
    return icons[code] || '🌤️';
}

// Enter key support
document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        getForecast();
    }
});
