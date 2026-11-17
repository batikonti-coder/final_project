function formatPrice(value) {
    return "$" + value;
}

class Tour {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.price = data.price;
        this.days = data.days;
        this.lat = data.lat;
        this.lon = data.lon;
        this.img = data.img;
    }

    get priceText() {
        return formatPrice(this.price);
    }

    matches(searchText, type) {
        const text = searchText.trim().toLowerCase();
        const matchesName = this.name.toLowerCase().includes(text);
        const matchesType = type === "All" || this.type === type;
        return matchesName && matchesType;
    }

    totalFor(people) {
        return this.price * people;
    }
}

const allTours = tours.map(function (data) {
    return new Tour(data);
});

function findTour(id) {
    return allTours.find(function (tour) {
        return tour.id === id;
    });
}

class FavoritesList {
    constructor(storage) {
        this.storage = storage;
        this.ids = storage.load().filter(function (id) {
            return Number.isInteger(id) && findTour(id) !== undefined;
        });
    }

    get count() {
        return this.ids.length;
    }

    has(id) {
        return this.ids.includes(id);
    }

    toggle(id) {
        if (this.has(id)) {
            this.remove(id);
            return;
        }
        this.ids = [...this.ids, id];
        this.save();
    }

    remove(id) {
        this.ids = this.ids.filter(function (favId) {
            return favId !== id;
        });
        this.save();
    }

    clear() {
        this.ids = [];
        this.storage.clear();
    }

    getTours() {
        return this.ids.map(findTour);
    }

    getTotal() {
        return this.getTours().reduce(function (sum, tour) {
            return sum + tour.price;
        }, 0);
    }

    save() {
        this.storage.save(this.ids);
    }
}

class Booking {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.tourId = data.tourId;
        this.people = data.people;
        this.message = data.message;
        this.createdAt = data.createdAt;
    }

    get tour() {
        return findTour(this.tourId);
    }

    get total() {
        return this.tour.totalFor(this.people);
    }

    get dateText() {
        return new Date(this.createdAt).toLocaleDateString();
    }

    static isValid(data) {
        return data !== null
            && typeof data === "object"
            && Number.isInteger(data.id)
            && typeof data.name === "string"
            && typeof data.email === "string"
            && typeof data.message === "string"
            && typeof data.createdAt === "string"
            && Number.isInteger(data.people)
            && data.people > 0
            && findTour(data.tourId) !== undefined;
    }
}

class BookingManager {
    constructor(storage) {
        this.storage = storage;
        this.items = storage.load().filter(Booking.isValid).map(function (data) {
            return new Booking(data);
        });
    }

    get count() {
        return this.items.length;
    }

    find(id) {
        return this.items.find(function (booking) {
            return booking.id === id;
        });
    }

    add(data) {
        const booking = new Booking({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
        this.items = [...this.items, booking];
        this.save();
        return booking;
    }

    update(id, data) {
        this.items = this.items.map(function (booking) {
            return booking.id === id ? new Booking({ ...booking, ...data }) : booking;
        });
        this.save();
    }

    remove(id) {
        this.items = this.items.filter(function (booking) {
            return booking.id !== id;
        });
        this.save();
    }

    clear() {
        this.items = [];
        this.storage.clear();
    }

    save() {
        this.storage.save(this.items);
    }
}
