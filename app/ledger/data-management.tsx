'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Database } from 'lucide-react'
import { deleteAllTransactions } from '@/app/actions/transaction'

interface DataManagementProps {
    walletId?: string
    monthId?: string
    importBatchId?: string
    importBatchName?: string
    totalCount: number
    onSuccess: () => void
}

export function DataManagement({ walletId, monthId, importBatchId, importBatchName, totalCount, onSuccess }: DataManagementProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteMode, setDeleteMode] = useState<'FILTERED' | 'ALL'>('FILTERED')

    const handleDelete = async () => {
        setDeleting(true)
        try {
            // If mode is ALL, pass undefined to force global delete
            const wId = deleteMode === 'ALL' ? undefined : walletId
            const mId = deleteMode === 'ALL' ? undefined : monthId
            const bId = deleteMode === 'ALL' ? undefined : importBatchId

            const result = await deleteAllTransactions(wId, mId, bId)

            alert(`Deleted ${result.count} transactions successfully`)
            setShowConfirm(false)
            onSuccess()
        } catch (error: any) {
            alert('Error deleting transactions: ' + error.message)
        } finally {
            setDeleting(false)
        }
    }

    const hasFilters = !!walletId || !!monthId || !!importBatchId

    return (
        <div className="flex items-center gap-2">
            {totalCount > 0 && (
                <>
                    {!showConfirm ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setDeleteMode(hasFilters ? 'FILTERED' : 'ALL')
                                setShowConfirm(true)
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {hasFilters ? 'Delete...' : 'Delete All'}
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg absolute right-4 top-20 z-10 w-80">
                            <div className="flex items-center gap-2 text-red-700 font-medium border-b border-red-200 pb-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                Confirm Deletion
                            </div>

                            {hasFilters && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Option 1: Delete only what you see</p>
                                    <Button
                                        variant={deleteMode === 'FILTERED' ? "destructive" : "outline"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        size="sm"
                                        onClick={() => setDeleteMode('FILTERED')}
                                    >
                                        <div className="flex flex-col items-start overflow-hidden w-full">
                                            <div className="flex items-center">
                                                <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>Delete Filtered ({totalCount} txs)</span>
                                            </div>
                                            {!!importBatchName && (
                                                <span className="text-[10px] opacity-90 truncate w-full pl-6">
                                                    File: {importBatchName}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    {hasFilters ? 'Option 2: Delete EVERYTHING in database' : 'Delete all transactions in database'}
                                </p>
                                <Button
                                    variant={deleteMode === 'ALL' ? "destructive" : "outline"}
                                    className="w-full justify-start"
                                    size="sm"
                                    onClick={() => setDeleteMode('ALL')}
                                >
                                    <Database className="w-4 h-4 mr-2" />
                                    Delete Database (All txs)
                                </Button>
                            </div>

                            <div className="flex gap-2 mt-2 pt-2 border-t border-red-200">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Confirm'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
