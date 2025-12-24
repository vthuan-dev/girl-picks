const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for pending comments...');
    const result = await prisma.reviewComment.updateMany({
        where: { status: 'PENDING' },
        data: { status: 'APPROVED' },
    });
    console.log(`Successfully approved ${result.count} comments.`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
