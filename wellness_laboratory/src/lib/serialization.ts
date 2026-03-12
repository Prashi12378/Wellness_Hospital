export function serializeData<T>(data: T): T {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data, (key, value) => {
        // Handle Decimal type from Prisma
        if (value && typeof value === 'object' && (value.constructor.name === 'Decimal' || value.d)) {
            return value.toString();
        }
        return value;
    }));
}
