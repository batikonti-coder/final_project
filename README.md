# Batyrkhan Travels — Final Project

## Project Overview
Final version of our travel website **Batyrkhan Travels** (midterm → endterm → final).
The topic, the 5 pages, Bootstrap layout and all earlier features (validation, jQuery, favorites, theme) still work.
The final stage adds live API data, classes, more localStorage and advanced features.

* **Live website:** https://batikonti-coder.github.io/final_project/
* **Repository:** https://github.com/batikonti-coder/final_project.git

## Team
* **Батырхан** — Group SE-2524 — all pages, JavaScript, jQuery, form validation, final features

## How to Test
1. Open the live link, or run `python -m http.server 8000` in the project folder and open `http://localhost:8000`.
2. **Tours page:** weather cards load at the top (spinner first). Turn off the internet and press "Refresh" to see the error state.
3. Search, filter by type, sort by price, and switch between pages (4 tours per page). The statistics panel updates.
4. Add tours to favorites, reload the page — they stay. "Clear favorites" removes them.
5. **Contact page:** fill the form, the price is calculated live. After sending, the booking appears in "My Bookings". Use Edit and Delete.
6. Use `A-`, `A`, `A+` and the Dark mode button in the menu. Reload — settings are saved.

## API Information
* **Open-Meteo** — https://open-meteo.com (free, public, no API key needed).
* Endpoint: `https://api.open-meteo.com/v1/forecast` with `latitude`, `longitude` and `current=temperature_2m,wind_speed_10m,weather_code`.
* Used in `js/weather.js` with `fetch` and `async/await`. States: loading (spinner), success (cards), empty data, error (message + "Try again"), timeout after 8 seconds.

## Final-Stage Features
1. **API integration** — live weather for every tour destination (Tours page).
2. **OOP** — classes `Tour`, `FavoritesList`, `Booking`, `BookingManager`, `WeatherInfo`, `WeatherService`, `SiteSettings`, `StorageHelper`; many objects are created from them.
3. **localStorage** — favorites, bookings and site settings (theme + font size) are saved as JSON. Wrong or missing data is handled safely in `StorageHelper`.
4. **CRUD** — bookings can be created, shown, edited and deleted (Contact page).
5. **Advanced search, sorting and pagination** — search + type filter + 4 sort modes + pages.
6. **Statistics panel** — count, average and cheapest price, bar chart of prices.
7. **Advanced form** — live calculated price (tour price × travelers), edit mode.
8. **Accessibility** — font size controls, saved with the theme.

## Project Structure
```
index.html, destinations.html, tours.html, about.html, contact.html
styles.css
js/
  storage.js          - StorageHelper (safe localStorage + JSON)
  data.js             - tours and tourTypes arrays
  models.js           - classes Tour, FavoritesList, Booking, BookingManager
  weather.js          - API: WeatherService, WeatherInfo, weather cards
  tours.js            - render tours, search, filter, sort, pages, statistics, favorites
  bookings.js         - bookings list, edit / delete, price preview
  form.js             - form validation and submit
  theme.js            - SiteSettings (dark theme, font size)
  jquery-features.js  - FAQ accordion, photo viewer, back to top
```

## Technologies
HTML5, CSS3, Bootstrap 5.3, JavaScript (ES6 classes, async/await, fetch), jQuery 3.7.1, Open-Meteo API
