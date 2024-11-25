const convertBlobToBin = async (blob: Blob) => {
    const buff = await blob.arrayBuffer()
    const bin = new Uint8Array(buff)
    return bin
}

const findExifStart = (bin: Uint8Array) => {
    return bin.findIndex((ch, i, arr) => {
        return i < arr.length - 1 && arr[i] === 0xFF && arr[i + 1] === 0xE1
    })
}

const parseBinNumber = (bin: Uint8Array, littleEndian: boolean) => {
    if (bin.length < 1) {
        return NaN
    }
    if(littleEndian) {
        bin.reverse()
    }
    let n = 0
    bin.forEach(c => {
        n = (n << 8) | c
    })
    return n
}

const parseBinString = (bin: Uint8Array) => {
    const arr: string[] = []
    bin.some(c => {
        if (c === 0) {
            return true
        }
        arr.push(c === 0 ? '' : String.fromCharCode(c))
        return false
    })
    return arr.join('')
}

const parseHex = (bin: Uint8Array, fmt: boolean = false, spliter = '') => {
    return Array.from(bin).map(c => {
        let s = c.toString(16).toUpperCase()
        if(s.length < 2) {
            s = '0' + s
        }
        if(fmt) {
            s = '0x' + s
        }
        return s
    }).join(spliter)
}

export const getExifSchema = async (file: File) => {
    const bin = await convertBlobToBin(file)
    const start = findExifStart(bin)
    // 未找到 0xFF 0xE1 标记
    if(start < 0) {
        return file
    }
    // 注意这里start是开始标记2字节的起始位置，后面需要加上2字节偏移
    const sizeBytes = bin.slice(start + 2, start + 4)
    const size = parseBinNumber(sizeBytes, false)

    const signBytes = bin.slice(start + 4, start + 8)
    const sign = parseBinString(signBytes)
    if(sign !== 'Exif') {
        return null
    }

    const endian = parseBinString(bin.slice(start + 10, start + 12))
    const littleEndian = endian === 'II'

    const version = parseBinNumber(bin.slice(start + 12, start + 14), littleEndian)
    const ifdOffset = parseBinNumber(bin.slice(start + 14, start + 18), littleEndian)
    const ifdStart = start + 2 + ifdOffset
    const tagCount = parseBinNumber(bin.slice(start + 18, start + 20), littleEndian)

    console.log(11111, { version, ifdStart, tagCount, versionBytes: bin.slice(start + 12, start + 14) })
}