
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const medicines = await prisma.pharmacyInventory.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(medicines);
    } catch (error) {
        console.error("Error fetching medicines:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, batchNo, hsnCode, expiryDate, price, gstRate, stock, location } = body;

        const medicine = await prisma.pharmacyInventory.create({
            data: {
                name,
                batchNo,
                hsnCode,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                price: parseFloat(price),
                gstRate: parseFloat(gstRate || 5),
                stock: parseInt(stock),
                location,
            }
        });

        return NextResponse.json(medicine);
    } catch (error) {
        console.error("Error creating medicine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
        }

        const updateData: any = { ...data };
        if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);
        if (data.price) updateData.price = parseFloat(data.price);
        if (data.gstRate) updateData.gstRate = parseFloat(data.gstRate);
        if (data.stock) updateData.stock = parseInt(data.stock);

        const medicine = await prisma.pharmacyInventory.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(medicine);
    } catch (error) {
        console.error("Error updating medicine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
        }

        await prisma.pharmacyInventory.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting medicine:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
