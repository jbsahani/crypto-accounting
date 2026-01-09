'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Database } from 'lucide-react'
import { deleteAllTransactions } from '@/app/actions/transaction'
import { useRouter } from 'next/navigation'

export function GlobalDelete() {
    const [showConfirm, setShowConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const result = await deleteAllTransactions(undefined, undefined, undefined)
            alert(`Deleted ${result.count} transactions (Database Cleared)`)
            setShowConfirm(false)
            router.refresh()
        } catch (error: any) {
            alert('Error deleting transactions: ' + error.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="relative">
            {!showConfirm ? (
                <Button
                    variant="outline"
                    className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => setShowConfirm(true)}
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Database
                </Button>
            ) : (
                <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg absolute right-0 top-12 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 text-red-700 font-medium border-b border-red-200 pb-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        Confirm Database Wipe
                    </div>

                    <p className="text-xs text-red-600/90">
                        This will permanently delete ALL transactions from the database. This action cannot be undone.
                    </p>

                    <div className="flex gap-2 mt-2 pt-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Confirm Wipe'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirm(false)}
                            className="h-8"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
