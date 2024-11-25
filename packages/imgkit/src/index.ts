export const readAsDataURL= (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        resolve(reader.result as string)
    })
    reader.addEventListener('error', err => {
        reject(err)
    })
    reader.readAsDataURL(blob)
})

export const getCropRectCover = (width: number, height: number, ratio: number) => {
    const r = width / height
    if(r > ratio) {
        const h = height
        const w = h * ratio
        return {
            left: (width - w) / 2,
            top: 0,
            width: w,
            height: h
        }
    } else {
        const w = width
        const h = w / ratio
        return {
            left: 0,
            top: (height - h) / 2,
            width: w,
            height: h,
        }
    }
}

export const base64ToBlob = (base64: string) => {
    const idx = base64.indexOf(',')
    const data = base64.substring(idx + 1)
    const binary = atob(data).split('').map(c => c.charCodeAt(0))
    const buff = new Uint8Array(binary.length)
    binary.forEach((c, i) => buff[i] = c)
    const blob = new Blob([buff.buffer])
    return blob
}

export const isNil = (v: unknown) => typeof v === 'undefined' || v === null || (typeof v === 'string' && v.length < 1) || (typeof v === 'number' && isNaN(v))
export const isValidNumber = (v: unknown): v is number => typeof v === 'number' && !isNaN(v)

const UNITS = ['KB', 'MB', 'GB']
export const parseSize = (size: number, unit: number = 1000) => {
    const us = [...UNITS]
    let s = size, u = 'B'
    while (s > unit && us.length > 0) {
        u = us.shift()!
        s /= unit
    }
    if (unit === 1024) {
        u = u.toLowerCase()
    }
    return Math.round(s * 100) / 100 + u
}