export function parseRowPattern(pattern: string): number[] {
    const rows: number[] = []
    const parts = pattern.split(",").map((p) => p.trim())

    for (const part of parts) {
        if (part.includes("-")) {
            const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10))
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    rows.push(i)
                }
            }
        } else {
            const num = parseInt(part, 10)
            if (!isNaN(num)) {
                rows.push(num)
            }
        }
    }

    return [...new Set(rows)].sort((a, b) => a - b)
}

export function rowMatchesPattern(row: number, pattern: string): boolean {
    return parseRowPattern(pattern).includes(row)
}
