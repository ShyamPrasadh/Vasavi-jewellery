import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Add additional loan entry
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { amount, date } = body;

        const additionalLoan = await prisma.additionalLoan.create({
            data: {
                amount: parseFloat(amount),
                date: new Date(date),
                loanId: id
            }
        });

        return NextResponse.json(additionalLoan);
    } catch (error: any) {
        console.error('Error adding additional loan:', error);
        return NextResponse.json({ error: 'Failed to add additional loan' }, { status: 500 });
    }
}

// Delete additional loan entry
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const additionalId = searchParams.get('additionalId');

        if (!additionalId) {
            return NextResponse.json({ error: 'additionalId is required' }, { status: 400 });
        }

        await prisma.additionalLoan.delete({
            where: { id: additionalId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting additional loan:', error);
        return NextResponse.json({ error: 'Failed to delete additional loan' }, { status: 500 });
    }
}
// Update additional loan entry
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { additionalId, amount, date } = body;

        if (!additionalId) {
            return NextResponse.json({ error: 'additionalId is required' }, { status: 400 });
        }

        const updated = await prisma.additionalLoan.update({
            where: { id: additionalId },
            data: {
                amount: parseFloat(amount),
                date: new Date(date)
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Error updating additional loan:', error);
        return NextResponse.json({ error: 'Failed to update additional loan' }, { status: 500 });
    }
}
