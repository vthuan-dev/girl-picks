const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRawUnsafe('DESCRIBE review_comments');
    result.forEach(r => console.log(r.Field));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
