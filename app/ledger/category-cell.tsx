'use client'

import { useState } from 'react'
import { updateTransactionCategory } from '@/app/actions/transaction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CategoryCellProps {
    transactionId: string
    initialCategoryId: string | null
    categories: { id: string, name: string }[]
}

export function CategoryCell({ transactionId, initialCategoryId, categories }: CategoryCellProps) {
    const [value, setValue] = useState(initialCategoryId || 'uncategorized')
    const [loading, setLoading] = useState(false)

    const handleValueChange = async (newVal: string) => {
        setValue(newVal)
        setLoading(true)
        try {
            await updateTransactionCategory(transactionId, newVal)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Select value={value} onValueChange={handleValueChange} disabled={loading}>
            <SelectTrigger className={cn("w-[180px]", !initialCategoryId && "border-orange-400 bg-orange-50")}>
                <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="uncategorized" className="text-muted-foreground font-light">
                    Uncategorized
                </SelectItem>
                {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
