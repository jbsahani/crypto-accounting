import { getWallets } from '@/app/actions/wallet'
import WalletsClient from './wallets-client'

export default async function WalletsPage() {
    const wallets = await getWallets()

    return <WalletsClient wallets={wallets} />
}
