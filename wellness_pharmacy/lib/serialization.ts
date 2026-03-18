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

export function formatMedicalDate(date: Date | string | null, fmt: string = 'dd/MM/yyyy'): string {
    if (!date) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (fmt === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
    return d.toDateString();
}
