'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileUpload } from '@/components/file-upload'
import { Plus, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { uploadTransactions } from '@/app/actions/upload'
import { deleteWallet } from '@/app/actions/wallet'
import { useRouter } from 'next/navigation'

interface ImportModalProps {
    wallets: any[]
}

export function ImportModal({ wallets }: ImportModalProps) {
    const [open, setOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [walletMode, setWalletMode] = useState<'EXISTING' | 'NEW'>(wallets.length > 0 ? 'EXISTING' : 'NEW')
    const [walletId, setWalletId] = useState('')
    const [newWalletName, setNewWalletName] = useState('')
    const [newWalletChain, setNewWalletChain] = useState('')
    const [mounted, setMounted] = useState(false)
    const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [message, setMessage] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Import Data
            </Button>
        )
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        // Validation
        if (walletMode === 'EXISTING' && !walletId) {
            alert('Select or enter a Wallet Name')
            return
        }
        if (walletMode === 'NEW' && !newWalletName) {
            alert('Enter a Wallet Name')
            return
        }

        setStatus('UPLOADING')

        const formData = new FormData()
        formData.append('file', selectedFile)
        if (walletMode === 'EXISTING') {
            formData.append('walletId', walletId)
        } else {
            formData.append('newWalletName', newWalletName)
            formData.append('newWalletChain', newWalletChain)
        }

        try {
            const result = await uploadTransactions(formData)
            setStatus('SUCCESS')
            setMessage(result.message)
            setSelectedFile(null)
            router.refresh()
            // Close after delay
            setTimeout(() => {
                setOpen(false)
                setStatus('IDLE')
            }, 1500)
        } catch (e: any) {
            setStatus('ERROR')
            setMessage(e.message)
        }
    }

    const handleDeleteWallet = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!walletId) return
        if (!confirm('Are you sure you want to delete this Wallet Name? This will only work if it has no transactions.')) return

        setIsDeleting(true)
        try {
            await deleteWallet(walletId)
            setWalletId('')
            router.refresh()
        } catch (e: any) {
            alert(e.message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Import Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Transactions</DialogTitle>
                    <DialogDescription>
                        Upload a file and assign it to a Wallet Name. We'll handle the dates.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* File Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">1. Transaction File</label>
                        <FileUpload onFileSelect={(f) => {
                            setSelectedFile(f)
                            setStatus('IDLE')
                        }} />
                        {selectedFile && <p className="text-xs text-green-600 font-medium">Selected: {selectedFile.name}</p>}
                    </div>

                    {/* Wallet Section */}
                    <div className="space-y-3">
                        {/* Wallet Choice */}
                        {wallets.length > 0 && (
                            <div className="flex gap-4 text-sm mb-4 border-b border-border">
                                <button
                                    onClick={() => setWalletMode('EXISTING')}
                                    className={`pb-2 px-1 ${walletMode === 'EXISTING' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Use Existing Wallet
                                </button>
                                <button
                                    onClick={() => setWalletMode('NEW')}
                                    className={`pb-2 px-1 ${walletMode === 'NEW' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Create New Wallet
                                </button>
                            </div>
                        )}

                        {walletMode === 'EXISTING' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">2. Wallet Name</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={walletId}
                                        onChange={(e) => setWalletId(e.target.value)}
                                    >
                                        <option value="">-- Select Wallet Name --</option>
                                        {wallets.map(w => (
                                            <option key={w.id} value={w.id}>{w.label || w.address}</option>
                                        ))}
                                    </select>
                                    {walletId && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 border-red-200"
                                            onClick={handleDeleteWallet}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {walletMode === 'NEW' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">2. Wallet Name</label>
                                    <input
                                        placeholder="E.g. Main Vault, Savings"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newWalletName}
                                        onChange={(e) => setNewWalletName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">3. Chain</label>
                                    <input
                                        placeholder="E.g. ETH, SOL, POLYGON"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newWalletChain}
                                        onChange={(e) => setNewWalletChain(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || status === 'UPLOADING'}
                        className="w-full h-12 text-md font-semibold"
                    >
                        {status === 'UPLOADING' ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        {status === 'UPLOADING' ? 'Importing...' : 'Import Transactions'}
                    </Button>

                    {status === 'SUCCESS' && (
                        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded border border-green-100">
                            <CheckCircle className="w-4 h-4" /> {message}
                        </div>
                    )}
                    {status === 'ERROR' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
                            <AlertCircle className="w-4 h-4" /> {message}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
