import { getWallets } from '@/app/actions/wallet'
import { getMonths } from '@/app/actions/month'
import UploadForm from './upload-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function UploadPage() {
    const wallets = await getWallets()
    const months = await getMonths()

    return (
        <div className="container py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Import Transactions</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Upload your blockchain transaction data from CSV or Excel files
                    </p>
                </div>
            </div>

            <UploadForm wallets={wallets} months={months} />
        </div>
    )
}
