'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from './data-table'
import { createColumns } from './columns'
import { TotalsSummary } from './totals-summary'
import { Button } from '@/components/ui/button'
import { bulkUpdateTransactionCategory } from '@/app/actions/transaction'
import { Check, X, Tag, Loader2, Trash2 } from 'lucide-react'

interface LedgerClientProps {
    data: any[]
    categories: any[]
    wallets: any[]
    months: any[]
    importBatches: any[]
    selectedMonthId: string
    selectedWalletId: string
    selectedImportBatchId: string
}

export function LedgerClient({ data = [], categories = [], wallets = [], months = [], importBatches = [], selectedMonthId, selectedWalletId, selectedImportBatchId }: LedgerClientProps) {
    const router = useRouter()
    const columns = createColumns(categories)
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [isBulkUpdating, setIsBulkUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Find selected batch for passing name
    const selectedBatch = importBatches.find(b => b.id === selectedImportBatchId)

    const handleBulkMap = async (categoryId: string) => {
        if (selectedRows.length === 0) return

        setIsBulkUpdating(true)
        try {
            await bulkUpdateTransactionCategory(selectedRows.map(r => r.id), categoryId)
            setSelectedRows([])
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsBulkUpdating(false)
        }
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId)

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const monthId = formData.get('monthId') as string
        const walletId = formData.get('walletId') as string
        const importBatchId = formData.get('importBatchId') as string

        const params = new URLSearchParams()
        if (monthId) params.set('monthId', monthId)
        if (walletId) params.set('walletId', walletId)
        if (importBatchId) params.set('importBatchId', importBatchId)

        router.push(`/?${params.toString()}`)
    }

    const handleDeleteFiltered = async () => {
        if (!selectedMonthId && !selectedWalletId && !selectedImportBatchId) {
            alert('Please select at least one filter to delete.')
            return
        }

        const confirmMsg = `Are you sure you want to delete the filtered transactions?`
        if (!confirm(confirmMsg)) return

        setIsDeleting(true)
        try {
            // Import this action dynamically to avoid server action issues if not needed
            const { deleteAllTransactions } = await import('@/app/actions/transaction')
            const result = await deleteAllTransactions(selectedWalletId || undefined, selectedMonthId || undefined, selectedImportBatchId || undefined)
            alert(`Deleted ${result.count} transactions.`)
            router.refresh()
        } catch (e: any) {
            alert(e.message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-8 relative">
            {/* Bulk Action Bar */}
            {selectedRows.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2 pr-4 border-r">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedRows.length}
                        </span>
                        <span className="text-sm font-medium">Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground mr-1" />
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-primary outline-none min-w-[150px]"
                            onChange={(e) => handleBulkMap(e.target.value)}
                            disabled={isBulkUpdating}
                            value=""
                        >
                            <option value="" disabled>Map to category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                            <option value="uncategorized">Uncategorized</option>
                        </select>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedRows([])}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>

                    {isBulkUpdating && (
                        <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                            {selectedWallet && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                    <span className="text-xs font-bold text-primary">{selectedWallet.label || "Wallet"}</span>
                                    <span className="w-1 h-1 bg-primary/40 rounded-full" />
                                    <span className="text-xs font-mono text-muted-foreground uppercase">{selectedWallet.chain}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-muted-foreground">Manage and categorize your crypto transactions.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-end gap-4 p-4 border rounded-xl bg-card shadow-sm">
                    <form onSubmit={handleFilterSubmit} className="flex gap-4 items-end w-full">
                        <div className="space-y-1.5 flex-1 max-w-xs">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</label>
                            <select name="monthId" defaultValue={selectedMonthId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <option value="">All Time</option>
                                {months.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 flex-1 max-w-xs">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet</label>
                            <select name="walletId" defaultValue={selectedWalletId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <option value="">All Wallets</option>
                                {wallets.map((w: any) => <option key={w.id} value={w.id}>{w.label || w.address?.slice(0, 10) || 'Unknown'}</option>)}
                            </select>
                        </div>

                        <div className="flex-1"></div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 shadow-sm"
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteFiltered}
                                disabled={isDeleting || (!selectedMonthId && !selectedWalletId && !selectedImportBatchId)}
                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 ${(selectedMonthId || selectedWalletId || selectedImportBatchId) ? '' : 'opacity-50 cursor-not-allowed text-muted-foreground hover:text-muted-foreground hover:bg-transparent'}`}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? 'Deleting...' : 'Delete Filtered'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {data.length > 0 ? (
                <>
                    <TotalsSummary transactions={data} />
                    <DataTable
                        columns={columns}
                        data={data}
                        onRowSelectionChange={setSelectedRows}
                    />
                </>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-lg font-medium text-muted-foreground mb-2">No transactions found</p>
                    <p className="text-sm text-muted-foreground">
                        {selectedMonthId || selectedWalletId ? 'Try adjusting your filters.' : 'Import data to get started.'}
                    </p>
                </div>
            )}
        </div>
    )
}
