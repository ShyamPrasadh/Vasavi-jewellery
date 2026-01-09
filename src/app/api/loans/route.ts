import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            billNumber,
            customerName,
            customerPhone,
            customerAadhaar,
            customerAddress,
            loanAmount,
            productType,
            loanDate,
            returnDate,
            interestRate,
            additionalLoans
        } = body;

        const loan = await prisma.loan.create({
            data: {
                billNumber,
                customerName,
                customerPhone,
                customerAadhaar,
                customerAddress,
                loanAmount: parseFloat(loanAmount),
                productType,
                loanDate: new Date(loanDate),
                returnDate: returnDate ? new Date(returnDate) : null,
                interestRate: parseFloat(interestRate),
                additionalLoans: additionalLoans?.length > 0 ? {
                    create: additionalLoans.map((entry: { amount: string; date: string }) => ({
                        amount: parseFloat(entry.amount),
                        date: new Date(entry.date)
                    }))
                } : undefined
            },
            include: {
                additionalLoans: true
            }
        });

        return NextResponse.json(loan);
    } catch (error: any) {
        console.error('Detailed Error creating loan:', error);
        return NextResponse.json({
            error: error.message || 'Failed to create loan',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const loans = await prisma.loan.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                additionalLoans: {
                    orderBy: {
                        date: 'asc'
                    }
                }
            }
        });
        return NextResponse.json(loans);
    } catch (error: any) {
        console.error('Error fetching loans:', error);
        return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
    }
}
