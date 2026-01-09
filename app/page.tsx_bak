import { getTransactions, getCategories } from '@/app/actions/transaction'
import { getWallets } from '@/app/actions/wallet'
import { getMonths } from '@/app/actions/month'
import { getImportBatches } from '@/app/actions/import-history'
import { LedgerClient } from './ledger-client'

export default async function LedgerPage({
    searchParams
}: {
    searchParams: Promise<{ monthId?: string, walletId?: string, importBatchId?: string }>
}) {
    // Await searchParams in Next.js 15+
    const params = await searchParams
    const selectedMonthId = params.monthId || ''
    const selectedWalletId = params.walletId || ''
    const selectedImportBatchId = params.importBatchId || ''

    console.log('Ledger page params:', { selectedMonthId, selectedWalletId, selectedImportBatchId })

    const [transactions, categories, wallets, months, importBatches] = await Promise.all([
        getTransactions(selectedMonthId, selectedWalletId, selectedImportBatchId),
        getCategories(),
        getWallets(),
        getMonths(),
        getImportBatches()
    ])

    // Transform data for table
    const data = transactions.map(tx => ({
        id: tx.id,
        timestamp: tx.timestamp,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: Number(tx.amount),
        symbol: tx.symbol,
        chain: tx.chain,
        direction: tx.direction,
        notes: tx.notes,
        wallet: tx.wallet,
        categoryId: tx.categoryId,
        category: tx.category,
        usdValue: tx.usdValue ? Number(tx.usdValue) : null
    }))

    return (
        <LedgerClient
            data={data}
            categories={categories}
            wallets={wallets}
            months={months}
            importBatches={importBatches}
            selectedMonthId={selectedMonthId}
            selectedWalletId={selectedWalletId}
            selectedImportBatchId={selectedImportBatchId}
        />
    )
}
