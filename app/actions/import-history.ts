'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getImportBatches() {
    return await prisma.importBatch.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50
    })
}

export async function deleteImportBatch(batchId: string) {
    if (!batchId) throw new Error('Batch ID required')

    // Delete transactions first (though relation might handle this if cascade is set, explicit is safer without cascade)
    // Note: Schema didn't specify onDelete: Cascade, so we must delete txs first
    const deletedTxs = await prisma.transaction.deleteMany({
        where: { importBatchId: batchId }
    })

    await prisma.importBatch.delete({
        where: { id: batchId }
    })

    revalidatePath('/')
    return { success: true, count: deletedTxs.count }
}
