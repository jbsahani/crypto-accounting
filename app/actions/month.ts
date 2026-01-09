'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createMonth(formData: FormData) {
    const name = formData.get('name') as string
    const startStr = formData.get('startDate') as string
    const endStr = formData.get('endDate') as string

    if (!name || !startStr || !endStr) throw new Error('All fields required')

    await prisma.accountingMonth.create({
        data: {
            name,
            startDate: new Date(startStr),
            endDate: new Date(endStr),
            status: 'OPEN'
        }
    })

    revalidatePath('/months')
}

export async function deleteMonth(monthId: string) {
    await prisma.accountingMonth.delete({
        where: { id: monthId }
    })

    revalidatePath('/months')
    return { success: true }
}

export async function getMonths() {
    return await prisma.accountingMonth.findMany({
        orderBy: { startDate: 'desc' }
    })
}
