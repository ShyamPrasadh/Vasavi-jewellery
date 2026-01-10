import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
            productWeight,
            loanDate,
            returnDate,
            interestRate,
            additionalLoans
        } = body;

        let finalBillNumber = billNumber;

        // Auto-generate sequential bill number if needed
        const year = new Date().getFullYear().toString().slice(-2);
        const prefix = `SVJ-P-${year}-`;

        const lastLoan = await prisma.loan.findFirst({
            where: {
                billNumber: {
                    startsWith: prefix
                }
            },
            orderBy: {
                billNumber: 'desc'
            }
        });

        let nextSeq = 1;
        if (lastLoan) {
            const parts = lastLoan.billNumber.split('-');
            const lastPart = parts[parts.length - 1];
            if (!isNaN(parseInt(lastPart))) {
                nextSeq = parseInt(lastPart) + 1;
            }
        }
        finalBillNumber = `${prefix}${nextSeq.toString().padStart(4, '0')}`;

        const loan = await prisma.loan.create({
            data: {
                billNumber: finalBillNumber,
                customerName,
                customerPhone,
                customerAadhaar,
                customerAddress,
                loanAmount: parseFloat(loanAmount),
                productType,
                productWeight: productWeight ? parseFloat(productWeight) : null,
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
