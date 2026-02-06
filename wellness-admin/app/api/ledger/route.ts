
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

        const transactions = await prisma.ledger.findMany({
            include: {
                user: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                transactionDate: 'desc'
            }
        });

        const formatted = transactions.map(t => ({
            id: t.id,
            transaction_type: t.transactionType,
            category: t.category,
            description: t.description,
            amount: t.amount,
            payment_method: t.paymentMethod,
            transaction_date: t.transactionDate,
            profiles: {
                full_name: t.user?.profile ? `${t.user.profile.firstName} ${t.user.profile.lastName}` : 'Unknown'
            }
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Ledger Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            transaction_type,
            category,
            description,
            amount,
            payment_method,
            transaction_date
        } = body;

        const transaction = await prisma.ledger.create({
            data: {
                transactionType: transaction_type,
                category,
                description,
                amount: parseFloat(amount),
                paymentMethod: payment_method,
                transactionDate: new Date(transaction_date),
                recordedBy: (session.user as any).id
            }
        });

        return NextResponse.json({ success: true, transaction });

    } catch (error) {
        console.error("Ledger Create Error:", error);
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
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.ledger.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Ledger Delete Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
