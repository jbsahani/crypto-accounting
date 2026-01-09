'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createWallet(formData: FormData) {
    const address = formData.get('address') as string
    const label = formData.get('label') as string
    const chain = formData.get('chain') as string

    if (!address || !chain) throw new Error('Address and Chain required')

    await prisma.wallet.create({
        data: {
            address,
            label,
            chain
        }
    })

    revalidatePath('/wallets')
}

export async function deleteWallet(walletId: string) {
    // Check if wallet has transactions
    const txCount = await prisma.transaction.count({
        where: { walletId }
    })

    if (txCount > 0) {
        throw new Error(`Cannot delete wallet: ${txCount} transaction${txCount > 1 ? 's' : ''} still exist. Delete transactions first.`)
    }

    await prisma.wallet.delete({
        where: { id: walletId }
    })

    revalidatePath('/')
    return { success: true }
}

export async function getWallets() {
    const wallets = await prisma.wallet.findMany({
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    })

    return wallets.map(w => ({
        ...w,
        transactionCount: w._count.transactions
    }))
}
