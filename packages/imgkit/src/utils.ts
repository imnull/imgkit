import { TExif } from "./exif"

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

const MIME_MAP: Record<string, string> = {
    '52494646': 'image/webp',
    'FFD8FFE0': 'image/jpeg',
    '424D': 'image/bmp',
    '47494638': 'image/gif',
    '49492A00': 'image/tiff',
}

export const getMagicMime = (base64: string) => {
    const idx = base64.indexOf(',')
    if(idx > -1) {
        const schema = base64.substring(0, idx)
        const start = schema.indexOf(':')
        const end = schema.indexOf(';')
        if(start > -1 && end > -1 && end > start + 2) {
            const mimeType = base64.substring(start + 1, end)
            return mimeType
        }
    }
    const binaryString = atob(base64.substring(idx + 1, idx + 9)).substring(0, 4)
    const sign = binaryString.split('').map(c => c.charCodeAt(0).toString(16)).join('').toUpperCase()
    const mimeType = MIME_MAP[sign] || 'application/bin'
    return { mimeType, sign }
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

export const exifHasSize = (exif: TExif) => {
    return (
        (isValidNumber(exif.ImageWidth) && (isValidNumber(exif.ImageLength) || isValidNumber(exif.ImageHeight)))
        || (isValidNumber(exif.PixelXDimension) && isValidNumber(exif.PixelYDimension))
    )
}

export const exifHasOrientation = (exif: TExif) => {
    return isValidNumber(exif.Orientation)
}

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