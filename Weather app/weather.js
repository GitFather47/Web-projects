const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
let isCelsius = true; // Default unit is Celsius

let originalTemperatures = {}; // Store original temperatures

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;

    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
            displayForecast(weatherData);
        } catch (error) {
            console.error(error);
            displayError(error);
        }
    } else {
        displayError("Please enter a city");
    }
});

async function getWeatherData(city) {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) { 
        throw new Error("Could not fetch geolocation data");
    }

    const geocodeData = await geocodeResponse.json();
    const { latitude, longitude } = geocodeData.results[0];

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode&hourly=apparent_temperature,relative_humidity_2m,surface_pressure&timezone=auto&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode,precipitation_sum,weathercode&daily.time=6`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch weather data");
    }

    return await response.json();
}

function displayWeatherInfo(data) {
    const weatherCode = data.current_weather.weathercode;
    const weatherEmojiSrc = getWeatherEmoji(weatherCode);

    const weatherEmojiImg = document.createElement("img");
    weatherEmojiImg.src = weatherEmojiSrc;
    weatherEmojiImg.alt = getWeatherDescription(weatherCode);
    weatherEmojiImg.classList.add("weatherEmojiImg");

    const { temperature, windspeed } = data.current_weather;
    const apparentTemperature = data.hourly.apparent_temperature[0];
    const sunrise = data.daily.sunrise[0];
    const sunset = data.daily.sunset[0];
    const humidity = data.hourly.relative_humidity_2m[0];
    const pressure = data.hourly.surface_pressure[0];

    // Store original temperatures
    originalTemperatures.current = {
        temperature,
        apparentTemperature
    };

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");

    const matrixContainer = document.createElement("div");
    matrixContainer.classList.add("matrixContainer");

    const feelsLikeDisplay = document.createElement("div");
    feelsLikeDisplay.textContent = `🌡Feels like: ${formatTemperature(apparentTemperature)}`;
    feelsLikeDisplay.classList.add("matrixItem");

    const windSpeedDisplay = document.createElement("div");
    windSpeedDisplay.textContent = `🌬Wind Speed: ${windspeed} km/h`;
    windSpeedDisplay.classList.add("matrixItem");

    const sunriseDisplay = document.createElement("div");
    sunriseDisplay.textContent = `🌅Sunrise: ${new Date(sunrise).toLocaleTimeString()}`;
    sunriseDisplay.classList.add("matrixItem");

    const sunsetDisplay = document.createElement("div");
    sunsetDisplay.textContent = `🌇Sunset: ${new Date(sunset).toLocaleTimeString()}`;
    sunsetDisplay.classList.add("matrixItem");

    const humidityDisplay = document.createElement("div");
    humidityDisplay.textContent = `💧Humidity: ${humidity}%`;
    humidityDisplay.classList.add("matrixItem");

    const pressureDisplay = document.createElement("div");
    pressureDisplay.textContent = `🔽Pressure: ${pressure} mbar`;
    pressureDisplay.classList.add("matrixItem");

    matrixContainer.appendChild(feelsLikeDisplay);
    matrixContainer.appendChild(windSpeedDisplay);
    matrixContainer.appendChild(sunriseDisplay);
    matrixContainer.appendChild(sunsetDisplay);
    matrixContainer.appendChild(humidityDisplay);
    matrixContainer.appendChild(pressureDisplay);

    cityDisplay.textContent = cityInput.value;
    tempDisplay.textContent = formatTemperature(temperature);
    descDisplay.textContent = getWeatherDescription(weatherCode);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    descDisplay.classList.add("descDisplay");

    // Remove the existing card before adding a new one
    const oldCard = document.querySelector(".card");
    if (oldCard) {
        oldCard.remove();
    }

    const newCard = document.createElement("div");
    newCard.classList.add("card", "fade-in");

    const unitToggleBtn = document.createElement("button");
    unitToggleBtn.textContent = isCelsius ? "°F" : "°C";
    unitToggleBtn.classList.add("unitToggle");
    unitToggleBtn.addEventListener("click", () => {
        isCelsius = !isCelsius;
        unitToggleBtn.textContent = isCelsius ? "°F" : "°C";
        updateTemperatures();
    });

    newCard.appendChild(unitToggleBtn);
    newCard.appendChild(cityDisplay);
    newCard.appendChild(tempDisplay);
    newCard.appendChild(weatherEmojiImg);
    newCard.appendChild(descDisplay);
    newCard.appendChild(matrixContainer);

    document.body.appendChild(newCard);

    setTimeout(() => {
        newCard.classList.add("visible");
    }, 10);
}


function displayForecast(data) {
    // Remove the existing forecast container before adding a new one
    const oldForecastContainer = document.querySelector(".forecastContainer");
    if (oldForecastContainer) {
        oldForecastContainer.remove();
    }

    const forecastContainer = document.createElement("div");
    forecastContainer.classList.add("forecastContainer");

    const forecastCardContainer = document.createElement("div");
    forecastCardContainer.classList.add("forecastCardContainer");

    // Store original temperatures for forecast
    originalTemperatures.forecast = {
        maxTemps: data.daily.temperature_2m_max.slice(),
        minTemps: data.daily.temperature_2m_min.slice()
    };

    for (let i = 0; i < 6; i++) { // Adjusted loop for 6 days
        const forecastDayCard = document.createElement("div");
        forecastDayCard.classList.add("forecastDayCard");

        const date = new Date(data.daily.time[i]);
        const maxTemp = data.daily.temperature_2m_max[i];
        const minTemp = data.daily.temperature_2m_min[i];
        const weatherCode = data.daily.weathercode[i];

        const dateDisplay = document.createElement("h3");
        const tempDisplay = document.createElement("p");
        const weatherDescDisplay = document.createElement("p");
        const weatherEmojiImg = document.createElement("img");

        dateDisplay.textContent = date.toLocaleDateString(undefined, { weekday: 'long' });
        tempDisplay.textContent = `${formatTemperature(maxTemp)} / ${formatTemperature(minTemp)}`;
        weatherDescDisplay.textContent = getWeatherDescription(weatherCode);
        weatherEmojiImg.src = getWeatherEmoji(weatherCode);
        weatherEmojiImg.alt = getWeatherDescription(weatherCode);
        weatherEmojiImg.classList.add("weatherEmojiImg");

        forecastDayCard.appendChild(dateDisplay);
        forecastDayCard.appendChild(weatherEmojiImg);
        forecastDayCard.appendChild(tempDisplay);
        forecastDayCard.appendChild(weatherDescDisplay);

        forecastCardContainer.appendChild(forecastDayCard);
    }

    forecastContainer.appendChild(forecastCardContainer);

    document.body.appendChild(forecastContainer);

    setTimeout(() => {
        forecastContainer.classList.add("visible");
    }, 10);
}


function formatTemperature(temp) {
    if (isCelsius) {
        return `${temp.toFixed(1)}°C`;
    } else {
        const fahrenheit = (temp * 9/5 + 32).toFixed(1);
        return `${fahrenheit}°F`;
    }
}

function updateTemperatures() {
    // Update current temperature display
    const tempDisplay = document.querySelector(".tempDisplay");
    if (tempDisplay) {
        const tempCelsius = originalTemperatures.current.temperature;
        const tempFahrenheit = (tempCelsius * 9/5 + 32).toFixed(1);
        tempDisplay.textContent = isCelsius ? `${tempCelsius.toFixed(1)}°C` : `${tempFahrenheit}°F`;
    }

    // Update feels like temperature display
    const feelsLikeDisplay = document.querySelector(".matrixContainer .matrixItem");
    if (feelsLikeDisplay) {
        const feelsLikeCelsius = originalTemperatures.current.apparentTemperature;
        const feelsLikeFahrenheit = (feelsLikeCelsius * 9/5 + 32).toFixed(1);
        feelsLikeDisplay.textContent = isCelsius ? `🌡Feels like: ${feelsLikeCelsius.toFixed(1)}°C` : `🌡Feels like: ${feelsLikeFahrenheit}°F`;
    }

    // Update forecast temperatures
    const forecastCards = document.querySelectorAll(".forecastDayCard");
    forecastCards.forEach((card, index) => {
        const tempDisplay = card.querySelector("p");
        if (tempDisplay) {
            const maxTempCelsius = originalTemperatures.forecast.maxTemps[index];
            const minTempCelsius = originalTemperatures.forecast.minTemps[index];
            const maxTempFahrenheit = (maxTempCelsius * 9/5 + 32).toFixed(1);
            const minTempFahrenheit = (minTempCelsius * 9/5 + 32).toFixed(1);
            tempDisplay.textContent = isCelsius ? `${maxTempCelsius.toFixed(1)}°C / ${minTempCelsius.toFixed(1)}°C` : `${maxTempFahrenheit}°F / ${minTempFahrenheit}°F`;
        }
    });
}
//Getting weather description
function getWeatherDescription(weatherCode) {
    switch (weatherCode) {
        case 0:
            return "Clear sky";
        case 1:
        case 2:
        case 3:
            return "Partly cloudy";
        case 45:
        case 48:
            return "Fog";
        case 51:
        case 53:
        case 55:
            return "Drizzle";
        case 61:
        case 63:
        case 65:
            return "Rain";
        case 71:
        case 73:
        case 75:
            return "Snow";
        case 80:
        case 81:
        case 82:
            return "Rain showers";
        case 95:
        case 96:
        case 99:
            return "Thunderstorm";
        default:
            return "Unknown weather";
    }
}

function getWeatherEmoji(weatherCode) {
    switch (weatherCode) {
        case 0:
            return "Images/clear-day.svg";
        case 1:
        case 2:
        case 3:
            return "Images/partly-cloudy-day.svg";
        case 45:
        case 48:
            return "Images/fog.svg";
        case 51:
        case 53:
        case 55:
            return "Images/drizzle.svg";
        case 61:
        case 63:
        case 65:
            return "Images/rain.svg";
        case 71:
        case 73:
        case 75:
            return "Images/frost.svg";
        case 80:
        case 81:
        case 82:
            return "Images/sun and rain.svg";
        case 95:
        case 96:
        case 99:
            return "Images/thunderstorms-rain.svg";
        default:
            return "Images/unknown.svg";
    }
}

function displayError(message) {
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");
    const card = document.querySelector(".card");
    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}
