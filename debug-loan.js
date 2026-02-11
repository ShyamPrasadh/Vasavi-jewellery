const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const loans = await prisma.loan.findMany({
        where: {
            customerPhone: '1234567898',
        },
        include: {
            additionalLoans: true
        }
    });
    console.log(JSON.stringify(loans, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
