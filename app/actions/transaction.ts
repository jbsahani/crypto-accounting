'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Dynamic Months: Get distinct year-month from transactions
export async function getDynamicMonths() {
    const transactions = await prisma.transaction.findMany({
        select: { timestamp: true },
        orderBy: { timestamp: 'desc' }
    })

    // Set to dedup e.g. "2025-12"
    const monthMap = new Map<string, Date>()

    transactions.forEach(tx => {
        const key = tx.timestamp.toISOString().slice(0, 7) // "YYYY-MM"
        if (!monthMap.has(key)) {
            monthMap.set(key, tx.timestamp)
        }
    })

    // Convert to array
    return Array.from(monthMap.entries()).map(([key, date]) => {
        return {
            id: key, // Use "YYYY-MM" as ID
            name: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }), // "Dec 2025"
            startDate: new Date(key + '-01'),
            endDate: new Date(new Date(key + '-01').setMonth(new Date(key + '-01').getMonth() + 1)) // Next month start (used for logic later)
        }
    })
}

export async function getTransactions(monthId?: string, walletId?: string, importBatchId?: string) {
    const where: any = {}

    // Filter by dynamic month ID "YYYY-MM"
    if (monthId && /^\d{4}-\d{2}$/.test(monthId)) {
        const start = new Date(monthId + '-01')
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)

        where.timestamp = {
            gte: start,
            lt: end
        }
        console.log(`Filtering dynamic month: ${monthId} (${start.toISOString()} - ${end.toISOString()})`)
    }

    if (walletId) {
        where.walletId = walletId
    }

    if (importBatchId) {
        where.importBatchId = importBatchId
    }

    return await prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        include: {
            category: true,
            wallet: true
        }
    })
}

export async function updateTransactionCategory(txId: string, categoryId: string) {
    if (!txId) throw new Error('Transaction ID required')

    await prisma.transaction.update({
        where: { id: txId },
        data: {
            categoryId: categoryId === 'uncategorized' ? null : categoryId,
            isMapped: categoryId !== 'uncategorized'
        }
    })

    revalidatePath('/') // Revalidate home
}

export async function deleteAllTransactions(walletId?: string, monthId?: string, importBatchId?: string) {
    const where: any = {}

    if (monthId && /^\d{4}-\d{2}$/.test(monthId)) {
        const start = new Date(monthId + '-01')
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)

        where.timestamp = {
            gte: start,
            lt: end
        }
    }

    if (walletId && walletId !== 'all') {
        where.walletId = walletId
    }

    if (importBatchId && importBatchId !== 'all') {
        where.importBatchId = importBatchId
    }

    const result = await prisma.transaction.deleteMany({
        where
    })

    revalidatePath('/')
    return { count: result.count }
}

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function bulkUpdateTransactionCategory(txIds: string[], categoryId: string) {
    if (!txIds || txIds.length === 0) throw new Error('No transactions selected')

    await prisma.transaction.updateMany({
        where: { id: { in: txIds } },
        data: {
            categoryId: categoryId === 'uncategorized' ? null : categoryId,
            isMapped: categoryId !== 'uncategorized'
        }
    })

    revalidatePath('/')
    return { success: true, count: txIds.length }
}
