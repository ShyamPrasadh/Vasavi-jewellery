import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
        const {
            customerName,
            customerPhone,
            customerAadhaar,
            customerAddress,
            loanAmount,
            productType,
            productWeight,
            loanDate,
            returnDate,
            interestRate
        } = body;

        const loan = await prisma.loan.update({
            where: { id },
            data: {
                customerName,
                customerPhone,
                customerAadhaar,
                customerAddress,
                loanAmount: parseFloat(loanAmount),
                productType,
                productWeight: productWeight ? parseFloat(productWeight) : null,
                loanDate: new Date(loanDate),
                returnDate: returnDate ? new Date(returnDate) : null,
                interestRate: parseFloat(interestRate)
            },
            include: {
                additionalLoans: true
            }
        });

        return NextResponse.json(loan);
    } catch (error: any) {
        console.error('Error updating loan:', error);
        return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
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
