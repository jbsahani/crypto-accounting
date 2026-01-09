import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TotalsSummaryProps {
    transactions: any[]
}

export function TotalsSummary({ transactions }: TotalsSummaryProps) {
    // Calculate totals using USD values when available, otherwise use token amounts
    const totalIn = transactions
        .filter(t => t.direction === 'IN')
        .reduce((sum, t) => {
            const value = t.usdValue || Number(t.amount)
            return sum + value
        }, 0)

    const totalOut = transactions
        .filter(t => t.direction === 'OUT')
        .reduce((sum, t) => {
            const value = t.usdValue || Number(t.amount)
            return sum + value
        }, 0)

    const unmapped = transactions.filter(t => !t.categoryId)
    const unmappedCount = unmapped.length

    // Group unmapped by Chain
    const unmappedByChain: Record<string, number> = {}
    unmapped.forEach(t => {
        const chain = t.chain || t.wallet?.chain || 'Unknown'
        unmappedByChain[chain] = (unmappedByChain[chain] || 0) + 1
    })

    const unmappedChainBreakdown = Object.entries(unmappedByChain)
        .map(([chain, count]) => `${chain}: ${count}`)
        .join(', ')

    // Group by Category using USD values
    const byCategory: Record<string, number> = {}
    transactions.forEach(t => {
        const categoryName = t.category?.name || 'Uncategorized'
        const value = t.usdValue || Number(t.amount)
        byCategory[categoryName] = (byCategory[categoryName] || 0) + value
    })

    // Sort categories by total value (descending)
    const sortedCategories = Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    // Check if we have any USD values
    const hasUsdValues = transactions.some(t => t.usdValue)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Net Flow {hasUsdValues ? '(USD)' : ''}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {hasUsdValues ? '$' : '+'}{totalIn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                        {hasUsdValues ? '-$' : '-'}{totalOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                        <div className="text-sm text-muted-foreground">Net</div>
                        <div className={`text-xl font-bold ${(totalIn - totalOut) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {hasUsdValues ? '$' : ''}{(totalIn - totalOut).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Unmapped Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-500">{unmappedCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {unmappedCount > 0 ? unmappedChainBreakdown : 'All mapped ✓'}
                    </p>
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Top Categories {hasUsdValues ? '(USD)' : ''}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {sortedCategories.length > 0 ? (
                            sortedCategories.map(([cat, amount]) => (
                                <div key={cat} className="flex justify-between text-sm">
                                    <span className="truncate mr-2">{cat}</span>
                                    <span className="font-mono whitespace-nowrap">
                                        {hasUsdValues ? '$' : ''}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No categories yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
