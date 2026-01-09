'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CategoryCell } from './category-cell'
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'

export type TransactionRow = {
    id: string
    timestamp: Date
    hash: string
    amount: number
    symbol: string
    chain: string
    direction: string
    wallet: { label: string | null, address: string, chain: string }
    categoryId: string | null
    isMapped: boolean
    usdValue?: number | null
}

const SignatureCell = ({ hash, chain }: { hash: string, chain: string }) => {
    const [copied, setCopied] = useState(false)

    const copy = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(hash)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getExplorerUrl = (chain: string, hash: string) => {
        const c = chain.toUpperCase()
        if (c === 'SOL' || c === 'SOLANA') return `https://solscan.io/tx/${hash}`
        if (c === 'ETH' || c === 'ETHEREUM') return `https://etherscan.io/tx/${hash}`
        if (c === 'MATIC' || c === 'POLYGON') return `https://polygonscan.com/tx/${hash}`
        if (c === 'ARB' || c === 'ARBITRUM') return `https://arbiscan.io/tx/${hash}`
        if (c === 'OP' || c === 'OPTIMISM') return `https://optimistic.etherscan.io/tx/${hash}`
        return `https://google.com/search?q=${hash}`
    }

    return (
        <div className="flex items-center gap-2 group">
            <a
                href={getExplorerUrl(chain, hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground hover:text-primary hover:underline"
            >
                {hash.slice(0, 4)}...{hash.slice(-4)}
            </a>
            <button
                onClick={copy}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Copy Signature"
            >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />}
            </button>
        </div>
    )
}

export const createColumns = (categories: { id: string, name: string }[]): ColumnDef<TransactionRow>[] => [
    {
        accessorKey: 'timestamp',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(row.getValue('timestamp'))
            return <div className="text-sm">{date.toLocaleDateString('en-US')}</div>
        }
    },
    {
        accessorKey: 'hash',
        header: 'Signature',
        cell: ({ row }) => <SignatureCell hash={row.getValue('hash')} chain={row.original.chain || row.original.wallet.chain} />
    },
    {
        id: 'value',
        header: 'Value (USD)',
        cell: ({ row }) => {
            const usdValue = row.original.usdValue
            const dir = row.original.direction

            if (usdValue !== null && usdValue !== undefined && usdValue > 0) {
                return (
                    <div className={`flex items-center font-mono text-sm font-semibold ${dir === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                        ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {dir === 'IN' ? <ArrowLeft className="w-4 h-4 ml-1" /> : <ArrowRight className="w-4 h-4 ml-1" />}
                    </div>
                )
            }

            const amount = row.original.amount
            const symbol = row.original.symbol
            return (
                <div className={`flex items-center font-mono text-xs ${dir === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                    {amount.toLocaleString('en-US')} {symbol}
                    {dir === 'IN' ? <ArrowLeft className="w-4 h-4 ml-1" /> : <ArrowRight className="w-4 h-4 ml-1" />}
                </div>
            )
        }
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
            return (
                <CategoryCell
                    transactionId={row.original.id}
                    initialCategoryId={row.original.categoryId}
                    categories={categories}
                />
            )
        }
    },
    {
        id: 'wallet',
        header: 'Wallet',
        cell: ({ row }) => {
            const wallet = row.original.wallet
            return (
                <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={wallet.label || wallet.address}>
                    {wallet.label || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                </div>
            )
        }
    },
    {
        id: 'chain',
        header: 'Chain',
        cell: ({ row }) => {
            return (
                <div className="text-xs uppercase text-muted-foreground">
                    {row.original.chain}
                </div>
            )
        }
    }
]
