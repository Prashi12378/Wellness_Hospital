import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        let whereClause = {};
        if (type) {
            whereClause = { type: type };
        }

        const packages = await prisma.healthPackage.findMany({
            where: whereClause,
            orderBy: { price: 'asc' }
        });

        // Map camelCase to snake_case for frontend compatibility
        const formatted = packages.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price), // Decimal to Number
            original_price: Number(p.originalPrice),
            includes: p.includes,
            icon: p.icon,
            popular: p.popular,
            type: p.type
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("Packages Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
