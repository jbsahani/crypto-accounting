'use server'

import { prisma } from '@/lib/prisma'
import { parseTransactionFile } from '@/lib/parser'
import { revalidatePath } from 'next/cache'

export async function uploadTransactions(formData: FormData) {
    const file = formData.get('file') as File
    const walletId = formData.get('walletId') as string
    const newWalletName = formData.get('newWalletName') as string
    const newWalletChain = formData.get('newWalletChain') as string || 'ETH'

    if (!file) throw new Error('Missing file')

    // Handle Wallet: Either use existing ID or create new
    let finalWalletId = walletId

    if (!finalWalletId && newWalletName) {
        // Create new wallet on the fly
        // Generate a placeholder address or leave it to be updated? 
        // Schema requires address. We'll generate a placeholder or use label as address if distinct.
        const placeholderAddress = `wallet-${Date.now()}` // Temporary unique address

        const newWallet = await prisma.wallet.create({
            data: {
                label: newWalletName,
                chain: newWalletChain,
                address: placeholderAddress
            }
        })
        finalWalletId = newWallet.id
        console.log('Created new wallet:', newWalletName)
    }

    if (!finalWalletId) throw new Error('No wallet selected or created')

    console.log('Starting file upload for wallet:', finalWalletId)

    let transactions
    try {
        transactions = await parseTransactionFile(file)
    } catch (error: any) {
        console.error('Parse error:', error)
        throw new Error(`Failed to parse file: ${error.message}`)
    }

    if (transactions.length === 0) {
        return { count: 0, message: 'No valid transactions found.' }
    }

    let wallet = await prisma.wallet.findUnique({ where: { id: finalWalletId } })
    if (!wallet) throw new Error('Wallet not found')

    // Smart Address Detection: If address is a placeholder, try to find the real one
    if (wallet.address.startsWith('wallet-')) {
        const addressCounts: Record<string, number> = {}
        transactions.forEach(tx => {
            if (tx.from && tx.from !== 'unknown') addressCounts[tx.from] = (addressCounts[tx.from] || 0) + 1
            if (tx.to && tx.to !== 'unknown') addressCounts[tx.to] = (addressCounts[tx.to] || 0) + 1
        })

        // Find the most frequent address
        let mostFrequent = wallet.address
        let maxCount = 0
        for (const [addr, count] of Object.entries(addressCounts)) {
            if (count > maxCount) {
                maxCount = count
                mostFrequent = addr
            }
        }

        if (maxCount > 0) {
            console.log(`Detected wallet address: ${mostFrequent} (appears ${maxCount} times)`)
            wallet = await prisma.wallet.update({
                where: { id: wallet.id },
                data: { address: mostFrequent }
            })
        }
    }

    let count = 0
    let errors = 0

    // Create Import Batch
    const importBatch = await prisma.importBatch.create({
        data: {
            filename: file.name,
            txCount: transactions.length
        }
    })

    for (const tx of transactions) {
        // Use parser-detected direction or calculate
        let direction = tx.direction || 'IN'

        if (!tx.direction) {
            if (wallet.address && tx.from && tx.from.toLowerCase() === wallet.address.toLowerCase()) {
                direction = 'OUT'
            }
        }

        const chain = tx.chain || wallet.chain

        try {
            await prisma.transaction.create({
                data: {
                    hash: tx.hash,
                    timestamp: tx.timestamp,
                    from: tx.from,
                    to: tx.to,
                    amount: Math.abs(tx.amount), // Always positive in DB, direction field handles flow
                    symbol: tx.symbol,
                    chain: chain,
                    walletId: finalWalletId,
                    direction: direction,
                    notes: tx.notes,
                    isMapped: false,
                    usdValue: tx.usdValue ? Math.abs(tx.usdValue) : null,
                    importBatchId: importBatch.id
                }
            })
            count++
        } catch (e: any) {
            if (e.code === 'P2002') continue // Skip duplicates
            console.error('Failed to import tx:', tx.hash, e.message)
            errors++
        }
    }

    revalidatePath('/') // Revalidate home

    let message = `Successfully imported ${count} transaction${count !== 1 ? 's' : ''}`
    if (errors > 0) message += ` (${errors} failed)`

    return { count, message }
}
