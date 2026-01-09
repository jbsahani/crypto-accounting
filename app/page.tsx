import { getTransactions, getCategories, getDynamicMonths } from '@/app/actions/transaction'
import { getWallets } from '@/app/actions/wallet'
import { getImportBatches } from '@/app/actions/import-history'
import { LedgerClient } from './ledger/ledger-client'
import { ImportModal } from '@/components/import-modal'
import { GlobalDelete } from '@/components/global-delete'
import { Upload } from 'lucide-react'

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ monthId?: string, walletId?: string, importBatchId?: string }>
}) {
  const params = await searchParams
  const selectedMonthId = params.monthId || ''
  const selectedWalletId = params.walletId || ''
  const selectedImportBatchId = params.importBatchId || ''

  // Fetch logic
  const [transactions, categories, wallets, months, importBatches] = await Promise.all([
    getTransactions(selectedMonthId, selectedWalletId, selectedImportBatchId),
    getCategories(),
    getWallets(),
    getDynamicMonths(),
    getImportBatches()
  ])

  // Transform data
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

  const hasData = data.length > 0 || selectedMonthId || selectedWalletId || selectedImportBatchId

  if (!hasData && wallets.length === 0) {
    return (
      <div className="container min-h-[80vh] flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome</h1>
          <p className="text-xl text-muted-foreground">
            Get started by importing your first blockchain transaction file.
          </p>
        </div>

        <div className="w-full max-w-sm p-6 border rounded-xl bg-card shadow-sm">
          <div className="space-y-4">
            <p className="text-sm font-medium text-center text-muted-foreground">Click below to upload data</p>
            <div className="flex justify-center">
              <ImportModal wallets={wallets} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your crypto transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportModal wallets={wallets} />
          <GlobalDelete />
        </div>
      </div>

      {/* Main Ledger View */}
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
    </div>
  )
}
