import { getMonths } from '@/app/actions/month'
import MonthsClient from './months-client'

export default async function MonthsPage() {
    const months = await getMonths()

    return <MonthsClient months={months} />
}
