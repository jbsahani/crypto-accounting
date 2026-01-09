import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./dev.db'
        }
    }
})
console.log('DATABASE_URL:', process.env.DATABASE_URL)

const categories = [
    { name: 'Cypher Card Load', type: 'TRANSFER' },
    { name: 'Cypher Physical Card Charges', type: 'EXPENSE' },
    { name: 'Product Expense', type: 'EXPENSE' },
    { name: 'Personal Expense', type: 'EXPENSE' },
    { name: 'Travel Expense', type: 'EXPENSE' },
    { name: 'Fee Expense', type: 'EXPENSE' },
    { name: 'MasterCard to Visa', type: 'TRANSFER' },
    { name: 'Marketing Expense', type: 'EXPENSE' },
    { name: 'Swap Trade', type: 'TRANSFER' },
    { name: 'Salary', type: 'INCOME' },
    { name: 'Refund', type: 'INCOME' },
    { name: 'Loan', type: 'TRANSFER' },
    { name: 'Spam', type: 'EXPENSE' },
    { name: 'Revenue', type: 'INCOME' },
    { name: 'Business Expense', type: 'EXPENSE' },
    { name: 'Reimbursement', type: 'INCOME' },
]

async function main() {
    console.log('Seeding categories...')
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        })
    }
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
