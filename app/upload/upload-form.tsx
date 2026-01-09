'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadTransactions } from '@/app/actions/upload'
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface UploadFormProps {
    wallets: any[]
    months: any[]
}

export default function UploadForm({ wallets, months }: UploadFormProps) {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [walletId, setWalletId] = useState('')
    const [monthId, setMonthId] = useState('')
    const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [message, setMessage] = useState('')

    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
        setStatus('IDLE')
        setMessage('')
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first')
            return
        }

        if (!walletId) {
            alert('Please select a wallet')
            return
        }

        setStatus('UPLOADING')
        setMessage('')

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('walletId', walletId)
        if (monthId) {
            formData.append('monthId', monthId)
        }

        try {
            const result = await uploadTransactions(formData)
            setStatus('SUCCESS')
            setMessage(result.message || 'Upload complete')
            setSelectedFile(null)
            router.refresh()
        } catch (e: any) {
            console.error(e)
            setStatus('ERROR')
            setMessage(e.message || 'Upload failed')
        }
    }

    const hasNoWallets = wallets.length === 0
    const hasNoMonths = months.length === 0

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Warnings */}
            {(hasNoWallets || hasNoMonths) && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <Info className="w-5 h-5" />
                            Setup Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-orange-700">
                        {hasNoWallets && (
                            <p>• Please add at least one wallet in <a href="/wallets" className="underline font-medium">Wallet Management</a> first.</p>
                        )}
                        {hasNoMonths && (
                            <p>• Please create at least one accounting month in <a href="/months" className="underline font-medium">Month Management</a> first.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Select Your Transaction File</CardTitle>
                    <CardDescription>
                        Upload CSV or Excel file containing your blockchain transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUpload onFileSelect={handleFileSelect} />
                    {selectedFile && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                            ✓ File selected: <span className="font-medium">{selectedFile.name}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Configuration Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 2: Configure Import Settings</CardTitle>
                    <CardDescription>
                        Specify which wallet and month these transactions belong to
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Wallet <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={walletId}
                                onChange={(e) => setWalletId(e.target.value)}
                                disabled={hasNoWallets}
                            >
                                <option value="">-- Select Wallet --</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.label || w.address.slice(0, 10)} ({w.chain})</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Required: Which wallet do these transactions belong to?</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Accounting Month <span className="text-muted-foreground">(Optional)</span>
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={monthId}
                                onChange={(e) => setMonthId(e.target.value)}
                                disabled={hasNoMonths}
                            >
                                <option value="">-- Select Month (Optional) --</option>
                                {months.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Optional: Link to a specific accounting period</p>
                        </div>
                    </div>

                    {/* Upload Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || !walletId || status === 'UPLOADING'}
                            className="w-full md:w-auto"
                            size="lg"
                        >
                            {status === 'UPLOADING' ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Import Transactions'
                            )}
                        </Button>
                    </div>

                    {/* Status Messages */}
                    {status === 'SUCCESS' && (
                        <div className="flex items-center gap-2 text-green-600 font-medium p-4 bg-green-50 rounded border border-green-200">
                            <CheckCircle className="w-5 h-5" /> {message}
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="flex items-center gap-2 text-red-600 font-medium p-4 bg-red-50 rounded border border-red-200">
                            <AlertCircle className="w-5 h-5" /> {message}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-base">Expected File Format</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-muted-foreground">
                    <p>Your CSV/Excel file should contain the following columns:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><span className="font-medium">Transaction Hash</span> (or hash, txhash)</li>
                        <li><span className="font-medium">Timestamp</span> (or date, time, datetime)</li>
                        <li><span className="font-medium">From</span> (sender address)</li>
                        <li><span className="font-medium">To</span> (receiver address)</li>
                        <li><span className="font-medium">Amount</span> (or value, quantity)</li>
                        <li><span className="font-medium">Symbol</span> (or token, asset, currency)</li>
                        <li>Chain (optional - will use wallet's chain)</li>
                        <li>Notes (optional)</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
