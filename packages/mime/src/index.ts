// const MIME_MAP: Record<string, string> = {
//     '52494646': 'image/webp',
//     'FFD8FFE0': 'image/jpeg',
//     '424D': 'image/bmp',
//     '47494638': 'image/gif',
//     '49492A00': 'image/tiff',
// }

import MIME_MAP from "./mime-map"

const MAX_LEN = MIME_MAP.reduce((r, v) => Math.max(r, v[0].length), 0)

const getMime = (sign: string) => {
    const item = MIME_MAP.find(it => sign.indexOf(it[0]) === 0)
    if(item) {
        return { type: item[1], ext: item[2] }
    }
    return { type: 'application/bin', ext: 'bin' }
}

export const getMagicMime = (bin: Uint8Array) => {
    const seg = bin.slice(0, MAX_LEN)
    const sign = Array.from(seg).map(n => {
        let s = n.toString(16).toUpperCase()
        if(s.length < 2) {
            s = '0' + s
        }
        return s
    }).join('')
    return getMime(sign)
}

const converBase64 = (base64: string) => {
    const binArr = atob(base64).split('').map(c => c.charCodeAt(0))
    const bin = new Uint8Array(binArr)
    return bin
}

export const getMagicMimeFromBase64 = (base64: string) => {
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
    const bin = converBase64(base64.substring(idx + 1, idx + 1 + MAX_LEN))
    return getMagicMime(bin)
}

// console.log('jpeg', getMagicMimeFromBase64('/9j/4AAQSkZJRgABAgEASABIAAD/4gIoSUN'))
// console.log('png', getMagicMimeFromBase64('iVBORw0KGgoAAAANSUhEUgAAAu4A'))