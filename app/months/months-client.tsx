'use client'

import { useState } from 'react'
import { getMonths, createMonth, deleteMonth } from '@/app/actions/month'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MonthsClientProps {
    months: Awaited<ReturnType<typeof getMonths>>
}

export default function MonthsClient({ months }: MonthsClientProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (monthId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete month "${name}"? This will not delete the transactions.`)) {
            return
        }

        setDeletingId(monthId)
        try {
            await deleteMonth(monthId)
            router.refresh()
        } catch (error: any) {
            alert('Error deleting month: ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="container py-10 space-y-8">
            <h1 className="text-3xl font-bold">Accounting Months</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Open New Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createMonth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Month Name</label>
                                <input
                                    name="name"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    placeholder="Jan 2024"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    />
                                </div>
                            </div>
                            <Button type="submit">Open Month</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Existing Months</h2>
                    {months.length === 0 ? (
                        <p className="text-muted-foreground">No months opened yet.</p>
                    ) : (
                        <div className="border rounded-md divide-y">
                            {months.map((m) => (
                                <div key={m.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium">{m.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                                            {m.status}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(m.id, m.name)}
                                            disabled={deletingId === m.id}
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
