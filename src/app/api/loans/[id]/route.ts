import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET single loan by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                additionalLoans: {
                    orderBy: { date: 'asc' }
                }
            }
        });

        if (!loan) {
            return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        }

        return NextResponse.json(loan);
    } catch (error: any) {
        console.error('Error fetching loan:', error);
        return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 });
    }
}

// UPDATE loan
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Prepare update data structure - support partial updates
        const updateData: any = {};

        if (body.customerName !== undefined) updateData.customerName = body.customerName;
        if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone;
        if (body.customerAadhaar !== undefined) updateData.customerAadhaar = body.customerAadhaar;
        if (body.customerAddress !== undefined) updateData.customerAddress = body.customerAddress;
        if (body.loanAmount !== undefined) updateData.loanAmount = parseFloat(body.loanAmount);
        if (body.productType !== undefined) updateData.productType = body.productType;
        if (body.productWeight !== undefined) updateData.productWeight = body.productWeight ? parseFloat(body.productWeight) : null;
        if (body.loanDate !== undefined) updateData.loanDate = new Date(body.loanDate);
        if (body.returnDate !== undefined) updateData.returnDate = body.returnDate ? new Date(body.returnDate) : null;
        if (body.interestRate !== undefined) updateData.interestRate = parseFloat(body.interestRate);
        if (body.status !== undefined) updateData.status = body.status;

        // Handle additional loans if provided (Nested Writes)
        if (body.additionalLoans) {
            const incomingLoans = body.additionalLoans;
            const incomingIds = incomingLoans.map((l: any) => l.id).filter((id: any) => id);

            updateData.additionalLoans = {
                // Delete missing ones
                deleteMany: {
                    id: { notIn: incomingIds }
                },
                // Update existing or Create new
                upsert: incomingLoans.map((loan: any) => ({
                    where: { id: loan.id || 'non_existent_id' },
                    update: {
                        amount: parseFloat(loan.amount),
                        date: new Date(loan.date)
                    },
                    create: {
                        amount: parseFloat(loan.amount),
                        date: new Date(loan.date)
                    }
                }))
            };
        }

        const loan = await prisma.loan.update({
            where: { id },
            data: updateData,
            include: {
                additionalLoans: true
            }
        });

        return NextResponse.json(loan);
    } catch (error: any) {
        console.error('Error updating loan:', error);
        return NextResponse.json({ error: 'Failed to update loan', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// DELETE loan
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.loan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting loan:', error);
        return NextResponse.json({ error: 'Failed to delete loan' }, { status: 500 });
    }
}
