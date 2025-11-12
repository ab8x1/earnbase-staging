export class Cache<T> {
    private cache: Record<string, T> = {}

    getOr = async (key: string, f: () => Promise<T>) => {
        if (!this.cache[key]) {
            this.cache[key] = await f()
        }
        return this.cache[key]
    }

    getOrSync = (key: string, f: () => T) => {
        if (!this.cache[key]) {
            this.cache[key] = f()
        }
        return this.cache[key]
    }
}
