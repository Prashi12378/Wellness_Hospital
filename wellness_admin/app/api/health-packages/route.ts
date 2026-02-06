import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HealthPackageType } from "@prisma/client";

export async function GET(req: Request) {
    console.log("Admin API: GET /api/health-packages called");
    try {
        const { searchParams } = new URL(req.url);
        const typeStr = searchParams.get('type');
        console.log("Admin API: GET params:", { typeStr });

        let whereClause = {};
        if (typeStr && Object.values(HealthPackageType).includes(typeStr as HealthPackageType)) {
            whereClause = { type: typeStr as HealthPackageType };
        }
        console.log("Admin API: GET whereClause:", JSON.stringify(whereClause));

        const packages = await prisma.healthPackage.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Admin API: GET found ${packages.length} packages`);

        return NextResponse.json(packages);
    } catch (error: any) {
        console.error("Packages Fetch Error Detailed:", error);
        console.error("Stack:", error.stack);

        if (error.code === 'P1001') {
            return NextResponse.json({
                error: "Database Connection Failed. Please check your AWS Security Group IP Whitelist.",
                code: "DB_CONNECTION_ERROR"
            }, { status: 503 });
        }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    console.log("Admin API: POST called");
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log("Admin API: POST Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            description,
            price,
            originalPrice,
            includes,
            icon,
            popular,
            type
        } = body;

        const p_price = parseFloat(price);
        const p_originalPrice = parseFloat(originalPrice || body.original_price || price);

        if (isNaN(p_price)) return NextResponse.json({ error: "Invalid price" }, { status: 400 });

        const validTypes = Object.values(HealthPackageType);
        const p_type = (type && validTypes.includes(type as HealthPackageType))
            ? (type as HealthPackageType)
            : HealthPackageType.GENERAL;

        console.log("Admin API: Creating package with type:", p_type);

        const newPackage = await prisma.healthPackage.create({
            data: {
                name,
                description,
                price: p_price,
                originalPrice: isNaN(p_originalPrice) ? p_price : p_originalPrice,
                includes: includes || [], // Prisma expects Json
                icon: icon || 'Stethoscope',
                popular: popular || false,
                type: p_type
            }
        });
        console.log("Admin API: POST success", newPackage.id);

        return NextResponse.json(newPackage);

    } catch (error: any) {
        console.error("Package Create Error Detailed:", error);
        console.error("Stack:", error.stack);

        if (error.code === 'P1001') {
            return NextResponse.json({
                error: "Database Connection Failed. Please check your AWS Security Group IP Whitelist.",
                code: "DB_CONNECTION_ERROR"
            }, { status: 503 });
        }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    console.log("Admin API: PUT called");
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log("Admin API: PUT Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        // Prepare updates, parsing numbers if needed
        const dataToUpdate: any = { ...updates };
        if (dataToUpdate.price) dataToUpdate.price = parseFloat(dataToUpdate.price);

        // Handle originalPrice / original_price normalization
        if (dataToUpdate.originalPrice !== undefined || dataToUpdate.original_price !== undefined) {
            const val = dataToUpdate.originalPrice !== undefined ? dataToUpdate.originalPrice : dataToUpdate.original_price;
            dataToUpdate.originalPrice = parseFloat(val);
            delete dataToUpdate.original_price;
        }

        const validTypes = Object.values(HealthPackageType);
        if (dataToUpdate.type && validTypes.includes(dataToUpdate.type as HealthPackageType)) {
            dataToUpdate.type = dataToUpdate.type as HealthPackageType;
        } else if (dataToUpdate.type) {
            delete dataToUpdate.type;
        }

        const updatedPackage = await prisma.healthPackage.update({
            where: { id },
            data: dataToUpdate
        });
        console.log("Admin API: PUT success", updatedPackage.id);

        return NextResponse.json(updatedPackage);

    } catch (error: any) {
        console.error("Package Update Error Detailed:", error);
        console.error("Stack:", error.stack);

        if (error.code === 'P1001') {
            return NextResponse.json({
                error: "Database Connection Failed. Please check your AWS Security Group IP Whitelist.",
                code: "DB_CONNECTION_ERROR"
            }, { status: 503 });
        }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    console.log("Admin API: DELETE called");
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log("Admin API: DELETE Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        if (id === 'all') {
            await prisma.healthPackage.deleteMany({});
        } else {
            await prisma.healthPackage.delete({
                where: { id }
            });
        }
        console.log("Admin API: DELETE success", id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Package Delete Error Detailed:", error);
        console.error("Stack:", error.stack);

        if (error.code === 'P1001') {
            return NextResponse.json({
                error: "Database Connection Failed. Please check your AWS Security Group IP Whitelist.",
                code: "DB_CONNECTION_ERROR"
            }, { status: 503 });
        }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
