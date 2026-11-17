const PAGE_SIZE = 4;

const favorites = new FavoritesList(new StorageHelper("favoriteIds", []));
const viewState = { search: "", type: "All", sort: "default", page: 1 };

const sorters = {
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    "days-asc": function (a, b) { return a.days - b.days; },
    "name-asc": function (a, b) { return a.name.localeCompare(b.name); }
};

function getVisibleTours() {
    const filtered = allTours.filter(function (tour) {
        return tour.matches(viewState.search, viewState.type);
    });
    const sorter = sorters[viewState.sort];
    return sorter ? [...filtered].sort(sorter) : filtered;
}

function createTourCard(tour) {
    const col = document.createElement("div");
    col.className = "col-md-6 mb-4";

    const saved = favorites.has(tour.id);

    col.innerHTML = `
        <div class="card h-100 shadow-sm tour-card">
            <img src="${tour.img}" class="card-img-top" alt="${tour.name}">
            <div class="card-body d-flex flex-column">
                <h5 class="fw-bold">${tour.name}</h5>
                <p class="text-muted mb-1">${tour.type} · ${tour.days} days</p>
                <p class="fs-5"><b>${tour.priceText}</b></p>
                <button type="button" class="btn ${saved ? "btn-danger" : "btn-outline-danger"} fav-btn mt-auto" data-id="${tour.id}">
                    ${saved ? "❤️ Saved" : "🤍 Add to Favorites"}
                </button>
            </div>
        </div>
    `;
    return col;
}

function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    for (let page = 1; page <= totalPages; page++) {
        const li = document.createElement("li");
        li.className = "page-item" + (page === viewState.page ? " active" : "");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-link";
        button.textContent = page;
        button.dataset.page = page;
        button.setAttribute("aria-label", "Page " + page);

        li.appendChild(button);
        pagination.appendChild(li);
    }
}

function renderStats(visible) {
    const chart = document.getElementById("price-chart");
    chart.innerHTML = "";

    const prices = visible.map(function (tour) { return tour.price; });
    const maxPrice = Math.max(...prices, 1);
    const sum = prices.reduce(function (total, price) { return total + price; }, 0);

    document.getElementById("stat-count").textContent = visible.length;
    document.getElementById("stat-average").textContent = visible.length ? formatPrice(Math.round(sum / visible.length)) : "-";
    document.getElementById("stat-cheapest").textContent = visible.length ? formatPrice(Math.min(...prices)) : "-";

    visible.forEach(function (tour) {
        const row = document.createElement("div");
        row.className = "mb-2";

        const label = document.createElement("div");
        label.className = "small";
        label.textContent = tour.name;

        const progress = document.createElement("div");
        progress.className = "progress";

        const bar = document.createElement("div");
        bar.className = "progress-bar";
        bar.style.width = Math.round(tour.price / maxPrice * 100) + "%";
        bar.textContent = tour.priceText;

        progress.appendChild(bar);
        row.append(label, progress);
        chart.appendChild(row);
    });
}

function renderTours() {
    const container = document.getElementById("tours-container");
    const noResults = document.getElementById("no-results");
    const resultCount = document.getElementById("result-count");

    const visible = getVisibleTours();
    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    viewState.page = Math.min(viewState.page, totalPages);

    const start = (viewState.page - 1) * PAGE_SIZE;
    const pageTours = visible.slice(start, start + PAGE_SIZE);

    container.innerHTML = "";
    pageTours.forEach(function (tour) {
        container.appendChild(createTourCard(tour));
    });

    resultCount.textContent = "Showing " + pageTours.length + " of " + visible.length + " tours (total " + allTours.length + ")";
    noResults.classList.toggle("d-none", visible.length !== 0);

    renderPagination(totalPages);
    renderStats(visible);
}

function fillTypeFilter() {
    const select = document.getElementById("type-filter");

    tourTypes.forEach(function (type) {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
    });
}

function renderFavorites() {
    const list = document.getElementById("favorites-list");
    const empty = document.getElementById("fav-empty");
    const total = document.getElementById("fav-total");
    const clearBtn = document.getElementById("clear-favorites");

    list.innerHTML = "";

    favorites.getTours().forEach(function (tour) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center px-0";

        const name = document.createElement("span");
        name.textContent = tour.name + " (" + tour.priceText + ")";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn btn-sm btn-outline-secondary remove-fav";
        removeBtn.textContent = "✕";
        removeBtn.setAttribute("aria-label", "Remove " + tour.name);
        removeBtn.dataset.id = tour.id;

        li.append(name, removeBtn);
        list.appendChild(li);
    });

    document.getElementById("fav-count").textContent = favorites.count;
    empty.style.display = favorites.count === 0 ? "block" : "none";
    clearBtn.classList.toggle("d-none", favorites.count === 0);
    total.textContent = favorites.count > 0 ? "Total: " + formatPrice(favorites.getTotal()) : "";
}

function refreshAll() {
    renderTours();
    renderFavorites();
}

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("tours-container");
    if (!container) return;

    fillTypeFilter();
    refreshAll();

    document.getElementById("search-tour").addEventListener("input", function (event) {
        viewState.search = event.target.value;
        viewState.page = 1;
        renderTours();
    });

    document.getElementById("type-filter").addEventListener("change", function (event) {
        viewState.type = event.target.value;
        viewState.page = 1;
        renderTours();
    });

    document.getElementById("sort-tour").addEventListener("change", function (event) {
        viewState.sort = event.target.value;
        viewState.page = 1;
        renderTours();
    });

    document.getElementById("pagination").addEventListener("click", function (event) {
        const btn = event.target.closest(".page-link");
        if (btn) {
            viewState.page = Number(btn.dataset.page);
            renderTours();
        }
    });

    container.addEventListener("click", function (event) {
        const btn = event.target.closest(".fav-btn");
        if (btn) {
            favorites.toggle(Number(btn.dataset.id));
            refreshAll();
        }
    });

    document.getElementById("favorites-list").addEventListener("click", function (event) {
        const btn = event.target.closest(".remove-fav");
        if (btn) {
            favorites.remove(Number(btn.dataset.id));
            refreshAll();
        }
    });

    document.getElementById("clear-favorites").addEventListener("click", function () {
        favorites.clear();
        refreshAll();
    });
});
