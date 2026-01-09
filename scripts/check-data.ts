
import { prisma } from '../lib/prisma'

async function main() {
    try {
        const count = await prisma.transaction.count()
        console.log(`Total transactions in DB: ${count}`)

        if (count > 0) {
            const lastTx = await prisma.transaction.findFirst({ orderBy: { timestamp: 'desc' }, include: { wallet: true, importBatch: true } })
            console.log('Last TX:', lastTx)

            const batches = await prisma.importBatch.findMany({ orderBy: { timestamp: 'desc' }, take: 1 })
            console.log('Last Import Batch:', batches[0])
        } else {
            console.log('Database is empty.')
        }

        const wallets = await prisma.wallet.findMany()
        console.log('Wallets:', wallets)

    } catch (e) {
        console.error(e)
    }
}

main()
