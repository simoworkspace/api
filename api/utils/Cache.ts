export class Cache<K, V> extends Map<K, V> {
    public constructor(public lifetime: number) {
        super();
    }

    public set(key: K, value: V) {
        if (this.has(key)) return super.set(key, value);

        setTimeout(() => this.delete(key), this.lifetime);

        return super.set(key, value);
    }
}
