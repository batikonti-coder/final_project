const bookingManager = new BookingManager(new StorageHelper("bookings", []));
let editingBookingId = null;

function fillTourSelect() {
    const select = document.getElementById("tourSelect");

    allTours.forEach(function (tour) {
        const option = document.createElement("option");
        option.value = tour.id;
        option.textContent = tour.name + " (" + tour.priceText + " per person)";
        select.appendChild(option);
    });
}

function updatePricePreview() {
    const preview = document.getElementById("price-preview");
    const tour = findTour(Number(document.getElementById("tourSelect").value));
    const people = Number(document.getElementById("people").value);

    if (!tour || !Number.isInteger(people) || people < 1) {
        preview.textContent = "Choose a tour and travelers to see the price.";
        return;
    }
    preview.textContent = "Estimated price: " + formatPrice(tour.totalFor(people)) + " (" + people + " x " + tour.priceText + ")";
}

function setEditMode(isEditing) {
    document.getElementById("submit-btn").textContent = isEditing ? "Update Booking" : "Send Request";
    document.getElementById("cancel-edit").classList.toggle("d-none", !isEditing);
    document.getElementById("form-title").textContent = isEditing ? "Edit Booking" : "Book a Tour";
}

function resetBookingForm() {
    editingBookingId = null;
    setEditMode(false);
    updatePricePreview();
}

function startEdit(id) {
    const booking = bookingManager.find(id);
    if (!booking) return;

    editingBookingId = id;
    document.getElementById("user-name").value = booking.name;
    document.getElementById("user-email").value = booking.email;
    document.getElementById("tourSelect").value = booking.tourId;
    document.getElementById("people").value = booking.people;
    document.getElementById("messageInput").value = booking.message;
    document.getElementById("char-count").textContent = booking.message.length;

    formRules.forEach(function (rule) {
        document.getElementById(rule.id).classList.remove("is-valid", "is-invalid");
    });

    setEditMode(true);
    updatePricePreview();
    document.getElementById("contact-form").scrollIntoView({ behavior: "smooth" });
}

function createBookingCard(booking) {
    const col = document.createElement("div");
    col.className = "col-md-6";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "fw-bold";
    title.textContent = booking.tour.name;

    const info = document.createElement("p");
    info.className = "mb-1";
    info.textContent = booking.name + " · " + booking.email;

    const details = document.createElement("p");
    details.className = "mb-1";
    details.textContent = booking.people + " traveler(s) · " + formatPrice(booking.total) + " · " + booking.dateText;

    const message = document.createElement("p");
    message.className = "text-muted small";
    message.textContent = booking.message;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm btn-outline-primary me-2 edit-booking";
    editBtn.textContent = "Edit";
    editBtn.dataset.id = booking.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm btn-outline-danger delete-booking";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.id = booking.id;

    body.append(title, info, details, message, editBtn, deleteBtn);
    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function renderBookings() {
    const list = document.getElementById("booking-list");
    list.innerHTML = "";

    bookingManager.items.forEach(function (booking) {
        list.appendChild(createBookingCard(booking));
    });

    document.getElementById("booking-count").textContent = bookingManager.count;
    document.getElementById("booking-empty").classList.toggle("d-none", bookingManager.count !== 0);
    document.getElementById("clear-bookings").classList.toggle("d-none", bookingManager.count === 0);
}

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("booking-list");
    if (!list) return;

    fillTourSelect();
    renderBookings();
    updatePricePreview();

    document.getElementById("tourSelect").addEventListener("change", updatePricePreview);
    document.getElementById("people").addEventListener("input", updatePricePreview);

    list.addEventListener("click", function (event) {
        const editBtn = event.target.closest(".edit-booking");
        const deleteBtn = event.target.closest(".delete-booking");

        if (editBtn) {
            startEdit(Number(editBtn.dataset.id));
        }
        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.id);
            bookingManager.remove(id);
            if (editingBookingId === id) {
                document.getElementById("contact-form").reset();
                resetBookingForm();
            }
            renderBookings();
        }
    });

    document.getElementById("clear-bookings").addEventListener("click", function () {
        if (window.confirm("Delete all bookings?")) {
            bookingManager.clear();
            renderBookings();
        }
    });

    document.getElementById("cancel-edit").addEventListener("click", function () {
        const form = document.getElementById("contact-form");
        form.reset();
        document.getElementById("char-count").textContent = "0";
        formRules.forEach(function (rule) {
            document.getElementById(rule.id).classList.remove("is-valid", "is-invalid");
        });
        resetBookingForm();
    });
});
