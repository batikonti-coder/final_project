const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_TIMEOUT_MS = 8000;

function describeWeather(code) {
    if (code === 0) return { text: "Clear sky", icon: "☀️" };
    if (code <= 3) return { text: "Partly cloudy", icon: "⛅" };
    if (code <= 48) return { text: "Fog", icon: "🌫️" };
    if (code <= 57) return { text: "Drizzle", icon: "🌦️" };
    if (code <= 67) return { text: "Rain", icon: "🌧️" };
    if (code <= 77) return { text: "Snow", icon: "❄️" };
    if (code <= 82) return { text: "Rain showers", icon: "🌧️" };
    if (code <= 86) return { text: "Snow showers", icon: "🌨️" };
    return { text: "Thunderstorm", icon: "⛈️" };
}

class WeatherInfo {
    constructor(tour, current) {
        this.tour = tour;
        this.temperature = current ? current.temperature_2m : null;
        this.wind = current ? current.wind_speed_10m : null;
        this.code = current ? current.weather_code : null;
    }

    get description() {
        return describeWeather(this.code);
    }

    isValid() {
        return typeof this.temperature === "number" && typeof this.code === "number";
    }
}

class WeatherService {
    constructor(places) {
        this.places = places;
    }

    buildUrl() {
        const latitudes = this.places.map(function (place) { return place.lat; }).join(",");
        const longitudes = this.places.map(function (place) { return place.lon; }).join(",");
        return WEATHER_URL + "?latitude=" + latitudes + "&longitude=" + longitudes
            + "&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto";
    }

    async load() {
        const controller = new AbortController();
        const timer = setTimeout(function () { controller.abort(); }, WEATHER_TIMEOUT_MS);

        try {
            const response = await fetch(this.buildUrl(), { signal: controller.signal });
            if (!response.ok) {
                throw new Error("Server answered with status " + response.status + ".");
            }
            const data = await response.json();
            const items = Array.isArray(data) ? data : [data];
            const places = this.places;

            return items
                .map(function (item, index) { return new WeatherInfo(places[index], item.current); })
                .filter(function (info) { return info.isValid(); });
        } finally {
            clearTimeout(timer);
        }
    }
}

function getWeatherErrorText(error) {
    if (error.name === "AbortError") return "The weather server took too long to answer.";
    if (error instanceof TypeError) return "No internet connection. Please check your network.";
    return error.message;
}

function showWeatherState(activeId) {
    ["weather-loading", "weather-error", "weather-empty", "weather-list"].forEach(function (id) {
        document.getElementById(id).classList.toggle("d-none", id !== activeId);
    });
}

function createWeatherCard(info) {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-2";

    const card = document.createElement("div");
    card.className = "card h-100 text-center shadow-sm";

    const body = document.createElement("div");
    body.className = "card-body p-2";

    const icon = document.createElement("div");
    icon.className = "fs-2";
    icon.textContent = info.description.icon;

    const name = document.createElement("div");
    name.className = "fw-bold small";
    name.textContent = info.tour.name;

    const temp = document.createElement("div");
    temp.className = "fs-5";
    temp.textContent = Math.round(info.temperature) + "°C";

    const text = document.createElement("div");
    text.className = "text-muted small";
    text.textContent = info.description.text + ", wind " + Math.round(info.wind) + " km/h";

    body.append(icon, name, temp, text);
    card.appendChild(body);
    col.appendChild(card);
    return col;
}

async function loadWeather(service) {
    const list = document.getElementById("weather-list");
    showWeatherState("weather-loading");

    try {
        const results = await service.load();
        if (results.length === 0) {
            showWeatherState("weather-empty");
            return;
        }
        list.innerHTML = "";
        results.forEach(function (info) {
            list.appendChild(createWeatherCard(info));
        });
        showWeatherState("weather-list");
    } catch (error) {
        document.getElementById("weather-error-text").textContent = getWeatherErrorText(error);
        showWeatherState("weather-error");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("weather-list")) return;

    const service = new WeatherService(allTours);
    loadWeather(service);

    document.querySelectorAll("[data-weather-reload]").forEach(function (button) {
        button.addEventListener("click", function () {
            loadWeather(service);
        });
    });
});
