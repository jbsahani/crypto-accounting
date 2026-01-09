import { read, utils } from 'xlsx'

export interface ParsedTransaction {
    hash: string
    timestamp: Date
    from: string
    to: string
    amount: number
    symbol: string
    chain?: string
    walletAddress?: string
    notes?: string
    fee?: number
    usdValue?: number
    direction?: 'IN' | 'OUT'
}

export async function parseTransactionFile(file: File): Promise<ParsedTransaction[]> {
    const buffer = await file.arrayBuffer()
    const workbook = read(buffer, { type: 'array', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const jsonData = utils.sheet_to_json<any>(sheet, { defval: '' })

    console.log('Total rows in file:', jsonData.length)
    console.log('Sample row:', jsonData[0])

    const parsed = jsonData.map((row, index) => {
        // Basic normalization of keys
        const normalizedRow = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[key]
            return acc
        }, {} as any)

        // Debug: Log normalized keys for first row
        if (index === 0) {
            console.log('Normalized keys:', Object.keys(normalizedRow))
        }

        // Heuristic field mapping - be more flexible
        const hash = normalizedRow.transactionhash || normalizedRow.hash || normalizedRow.txhash ||
            normalizedRow.txid || normalizedRow.id || normalizedRow.transaction || normalizedRow.signature

        const timestampVal = normalizedRow.timestamp || normalizedRow.date || normalizedRow.datetime ||
            normalizedRow.time || normalizedRow.blocktime || normalizedRow.unixts ||
            normalizedRow.unixtimestamp

        const from = normalizedRow.from || normalizedRow.sender || normalizedRow.fromaddress ||
            normalizedRow.fromaddr

        const to = normalizedRow.to || normalizedRow.receiver || normalizedRow.toaddress ||
            normalizedRow.toaddr

        // Try to find USD value first (prioritize this)
        const usdValue = normalizedRow.usdvalue || normalizedRow.usd || normalizedRow.valueusd ||
            normalizedRow.historicalusd || normalizedRow.currentvalueusd || normalizedRow.value ||
            normalizedRow.valuein || normalizedRow.valueout || normalizedRow.totalvalue

        // Amount - if USD value exists, this might be the raw token amount
        const amount = normalizedRow.amount || normalizedRow.tokenamount ||
            normalizedRow.quantity || normalizedRow.qty

        const symbol = normalizedRow.symbol || normalizedRow.token || normalizedRow.asset ||
            normalizedRow.currency || normalizedRow.tokensymbol

        // Optional
        const chain = normalizedRow.chain || normalizedRow.network || normalizedRow.blockchain
        const notes = normalizedRow.notes || normalizedRow.memo || normalizedRow.description ||
            normalizedRow.method

        // Helper to clean numbers (remove $, thousands separators, etc)
        const cleanNum = (val: any) => {
            if (!val) return 0
            // Remove everything except digits, dots, and minus signs
            const str = String(val).replace(/[^0-9.-]/g, '')
            const num = parseFloat(str)
            return isNaN(num) ? 0 : num
        }

        // Amount
        let amountNum = cleanNum(amount)
        if (amountNum === 0) amountNum = cleanNum(normalizedRow.amount)

        // USD Value
        const usdValNum = cleanNum(usdValue)

        // Direction detection from type/amount
        let detectedDirection: 'IN' | 'OUT' | undefined = undefined

        const typeRaw = normalizedRow.type || normalizedRow.direction || normalizedRow.status ||
            normalizedRow.method || normalizedRow.action

        if (typeRaw) {
            const t = String(typeRaw).toUpperCase()
            if (t.includes('IN') || t.includes('RECEIVE') || t.includes('DEPOSIT') || t.includes('CREDIT') || t.includes('AIRDROP')) detectedDirection = 'IN'
            if (t.includes('OUT') || t.includes('SEND') || t.includes('SENT') || t.includes('WITHDRAW') || t.includes('PAY') || t.includes('DEBIT') || t.includes('SPEND')) detectedDirection = 'OUT'
        }

        // Amount sign check (negative = OUT)
        if (amountNum < 0) {
            detectedDirection = 'OUT'
            amountNum = Math.abs(amountNum)
        }

        // Must have at least amount or USD value
        if (amountNum === 0 && usdValNum === 0) {
            console.log(`Row ${index + 1}: Skipping row with 0/invalid amount`)
            return null
        }

        // Debug logging for first few rows
        if (index < 3) {
            console.log(`Row ${index + 1}: amount=${amount}, usdValue=${usdValue}, symbol=${symbol}`)
        }

        // Date parsing - be more flexible
        let timestamp = new Date()
        if (timestampVal) {
            if (timestampVal instanceof Date) {
                timestamp = timestampVal
            } else if (typeof timestampVal === 'number') {
                // Unix timestamp (seconds or milliseconds)
                const ts = timestampVal > 1000000000000 ? timestampVal : timestampVal * 1000
                timestamp = new Date(ts)
            } else {
                const d = new Date(timestampVal)
                if (!isNaN(d.getTime())) {
                    timestamp = d
                }
            }
        }

        // Generate a hash if missing
        let finalHash = hash

        if (!finalHash) {
            // Create a deterministic string: date-amount-symbol-from-to
            // This ensures if the same file is uploaded again, we get the same hash
            // and the database unique constraint will reject it.
            const dataString = `${timestamp.toISOString()}-${amount}-${symbol}-${from}-${to}`

            // Simple hash function for the ID (DJB2-like or similar) 
            // We don't need cryptographic security, just collision resistance for this specific use case
            let hashVal = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hashVal = ((hashVal << 5) - hashVal) + char;
                hashVal = hashVal & hashVal; // Convert to 32bit integer
            }

            // Hex string
            finalHash = `gen-${Math.abs(hashVal).toString(16)}-${timestamp.getTime()}`
        }

        return {
            hash: String(finalHash),
            timestamp,
            from: from ? String(from) : 'unknown',
            to: to ? String(to) : 'unknown',
            amount: amountNum,
            symbol: String(symbol || 'UNKNOWN'),
            chain: chain ? String(chain) : undefined,
            notes: notes ? String(notes) : undefined,
            usdValue: usdValNum || undefined,
            direction: detectedDirection
        } as ParsedTransaction
    }).filter((tx): tx is ParsedTransaction => tx !== null)

    console.log('Parsed transactions:', parsed.length)
    return parsed
}
