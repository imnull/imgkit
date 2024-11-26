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

const parseBinHex = (bin: Uint8Array, fmt: boolean = false, spliter = '') => {
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

const parseTagRaw = (bin: Uint8Array, littleEndian: boolean) => {
    const name = parseBinHex(bin.slice(0, 2))
    const type = parseBinHex(bin.slice(2, 4))
    const count = parseBinNumber(bin.slice(4, 8), littleEndian)
    const data = bin.slice(8)
    return { name, type, count, data }
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

    const signBytes = bin.slice(start + 4, start + 10)
    const sign = parseBinString(signBytes)
    if(sign !== 'Exif') {
        return null
    }

    const endian = parseBinString(bin.slice(start + 10, start + 12))
    const littleEndian = endian === 'II'

    // console.log(11111000, bin.slice(start + 12, start + 14))
    // console.log(11111001, Array.from(bin.slice(start + 12, start + 18)).map(c => c.toString(16).toUpperCase().padStart(2, '0')))
    const tiffMagicNumber = parseBinNumber(bin.slice(start + 12, start + 14), littleEndian)
    const ifdOffset = parseBinNumber(bin.slice(start + 14, start + 18), littleEndian)
    const ifdStart = start + 2 + ifdOffset
    const tagCount = parseBinNumber(bin.slice(start + 18, start + 20), littleEndian)
    

    let tagStart = start + 20
    const tags: { name: string; type: string; count: number; data: Uint8Array }[] = []
    for(let i = 0; i < tagCount; i++) {
        tags.push(parseTagRaw(bin.slice(tagStart, tagStart + 12), littleEndian))
        tagStart += 12
    }
    console.log(JSON.stringify(tags, null, '  '))

    // const binHead = file.slice(0, start)
    // const binTail = file.slice(start + 2 + size)
    // const noExifFile = new File([binHead, binTail], file.name, { type: file.type })
}


// PixelXDimension: 4032
// PixelYDimension: 3024
// ImageWidth: 4032
// ImageLength: 3024
// Orientation: 6


