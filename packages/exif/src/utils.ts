import { IMAGE_TAGS, PHOTO_TAGS, IOP_TAGS, GPSINFO_TAGS, MPFINFO_TAGS, TExifDataType, TYPE_MAP, TYPE_SIZE } from './presets'

export const GetBinString = (bin: Uint8Array, zeroStop: boolean = true) => {
    const arr: string[] = []
    bin.some(c => {
        if (c === 0 && zeroStop) {
            return true
        }
        arr.push(c === 0 ? '' : String.fromCharCode(c))
        return false
    })
    return arr.join('')
}

export const GetBinNumber = (bin: Uint8Array, littleEndian: boolean) => {
    if (bin.length < 1) {
        return NaN
    }
    let n = 0
    const arr = Array.from(bin)
    if (littleEndian) {
        arr.reverse()
    }
    arr.forEach(c => {
        n = (n << 8) | c
    })
    return n
}

export const GetBinHex = (bin: Uint8Array, littleEndian: boolean) => {
    if (bin.length < 1) {
        return ''
    }
    const arr = Array.from(bin)
    if (littleEndian) {
        arr.reverse()
    }
    const hex = arr.map(n => {
        let h = n.toString(16)
        if (h.length < 2) {
            h = '0' + h
        }
        return h
    }).join('')
    return '0x' + hex
}

export const ParseBinValue = (bin: Uint8Array, type: TExifDataType, littleEndian: boolean) => {
    switch (type) {
        case 'Rational': {
            if (bin.length === 8) {
                const a = GetBinNumber(bin.slice(0, 4), littleEndian)
                const b = GetBinNumber(bin.slice(4, 8), littleEndian)
                if (b === 1) {
                    return a
                }
                return a / b
            }
            // 经纬度
            else if (bin.length === 24) {
                const degrees = ParseBinValue(bin.slice(0, 8), 'Rational', littleEndian) as number
                const minutes = ParseBinValue(bin.slice(8, 16), 'Rational', littleEndian) as number
                const seconds = ParseBinValue(bin.slice(16, 24), 'Rational', littleEndian) as number
                // return `${degrees},${minutes},${seconds}`
                return degrees + (minutes / 60) + (seconds / 360)
            }

        }
        case 'Undefined':
        case 'Ascii':
        case 'Comment': {
            return GetBinString(bin)
        }
        case 'IFD':
        case 'Byte':
        case 'Short':
        case 'Long':
        case 'Long8':
            return GetBinNumber(bin, littleEndian)
        case 'SByte':
        case 'SShort':
        case 'SLong':
        case 'SLong8': {
            const bitLen = bin.length * 8
            const num = GetBinNumber(bin, littleEndian)
            // 判断正负，0表示符号位置为0，是正数
            if ((num & Math.pow(2, bitLen - 1)) === 0) {
                return num
            }
            return num - Math.pow(2, bitLen)
        }
        // case 'SFloat': {
        //     const num = GetBinNumber(bin)
        //     // 提取符号位（最高位）
        //     const sign = (num >> 31) & 1
        //     // 提取指数部分（接下来的 8 位）
        //     const exponent = (num >> 23) & 0xFF
        //     // 提取尾数部分（最后 23 位）
        //     const mantissa = num & 0x7FFFFF;
        //     // 计算指数的实际值
        //     const actualExponent = exponent - 127
        //     // 计算尾数部分（加上隐含的前导 1）
        //     const normalizedMantissa = 1 + mantissa / Math.pow(2, 23)
        //     // 计算浮点数值
        //     const result = Math.pow(-1, sign) * normalizedMantissa * Math.pow(2, actualExponent)
        //     return result
        // }
        case 'Float':
        case 'SFloat': {
            if (bin.length < 1) {
                return 0
            }
            return new DataView(bin.buffer).getFloat32(0, littleEndian)
        }
        case 'Double':
        case 'SDouble':
        case 'SRational': {
            if (bin.length < 1) {
                return 0
            }
            return new DataView(bin.buffer).getFloat64(0, littleEndian)
        }
    }
}

export const FindTagHex = (nameHex: string, typeHex: string) => {
    const item = IMAGE_TAGS[nameHex]
        || PHOTO_TAGS[nameHex]
        || GPSINFO_TAGS[nameHex]
        || MPFINFO_TAGS[nameHex]
        || IOP_TAGS[nameHex]
        || null

    if (item) {
        const size = TYPE_SIZE[item.type]
        return { ...item, size }
    } else {
        const type = TYPE_MAP[typeHex]
        if (!type) {
            return null
        }
        const size = TYPE_SIZE[type]
        return { type, key: nameHex, size }
    }
}