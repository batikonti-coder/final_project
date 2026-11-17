class StorageHelper {
    constructor(key, fallback) {
        this.key = key;
        this.fallback = fallback;
    }

    getFallback() {
        return Array.isArray(this.fallback) ? [] : { ...this.fallback };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw === null) {
                return this.getFallback();
            }
            const value = JSON.parse(raw);
            const sameKind = value !== null && typeof value === "object" && Array.isArray(value) === Array.isArray(this.fallback);
            return sameKind ? value : this.getFallback();
        } catch (error) {
            return this.getFallback();
        }
    }

    save(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            return;
        }
    }
}
