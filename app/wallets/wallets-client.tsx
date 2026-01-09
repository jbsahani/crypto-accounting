'use client'

import { useState } from 'react'
import { getWallets, createWallet, deleteWallet } from '@/app/actions/wallet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WalletsClientProps {
    wallets: Awaited<ReturnType<typeof getWallets>>
}

export default function WalletsClient({ wallets }: WalletsClientProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (walletId: string, label: string) => {
        if (!confirm(`Are you sure you want to delete wallet "${label}"?`)) {
            return
        }

        setDeletingId(walletId)
        try {
            await deleteWallet(walletId)
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="container py-10 space-y-8">
            <h1 className="text-3xl font-bold">Wallet Management</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Wallet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createWallet} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Wallet Address</label>
                                <input
                                    name="address"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    placeholder="0x..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Label</label>
                                <input
                                    name="label"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    placeholder="Main Vault"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Chain</label>
                                <select
                                    name="chain"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="ETH">Ethereum</option>
                                    <option value="MATIC">Polygon</option>
                                    <option value="SOL">Solana</option>
                                </select>
                            </div>
                            <Button type="submit">Add Wallet</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Existing Wallets</h2>
                    {wallets.length === 0 ? (
                        <p className="text-muted-foreground">No wallets added yet.</p>
                    ) : (
                        <div className="border rounded-md divide-y">
                            {wallets.map((w) => (
                                <div key={w.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium">{w.label || 'Unnamed'}</p>
                                        <p className="text-sm text-muted-foreground font-mono">{w.address}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {w.transactionCount} transaction{w.transactionCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                                            {w.chain}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(w.id, w.label || w.address)}
                                            disabled={deletingId === w.id}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
