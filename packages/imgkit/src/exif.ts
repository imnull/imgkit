import { IMAGE_TAGS, PHOTO_TAGS, IOP_TAGS, GPSINFO_TAGS, MPFINFO_TAGS, TExifDataType, TYPE_MAP, TYPE_SIZE } from './exif-presets'

export type TExifForce = {
    ImageWidth: number;
    ImageHeight: number;
    ImageLength: number;
    PixelXDimension: number;
    PixelYDimension: number;
    Orientation: number;
}

export type TExif = {
    [key in keyof TExifForce]?: number;
}

export class BinOperator {

    static GetBinString(bin: Uint8Array, zeroStop: boolean = true) {
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

    static GetBinNumber(bin: Uint8Array, littleEndian: boolean) {
        if(bin.length < 1) {
            return NaN
        }
        let n = 0
        const arr = Array.from(bin)
        if(littleEndian) {
            arr.reverse()
        }
        arr.forEach(c => {
            n = (n << 8) | c
        })
        return n
    }

    static GetBinHex(bin: Uint8Array, littleEndian: boolean) {
        if (bin.length < 1) {
            return ''
        }
        const arr = Array.from(bin)
        if(littleEndian) {
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

    static ParseBinValue(bin: Uint8Array, type: TExifDataType, littleEndian: boolean) {
        switch (type) {
            case 'Rational': {
                if (bin.length === 8) {
                    const a = BinOperator.GetBinNumber(bin.slice(0, 4), littleEndian)
                    const b = BinOperator.GetBinNumber(bin.slice(4, 8), littleEndian)
                    if (b === 1) {
                        return a
                    }
                    return a / b
                }
                // 经纬度
                else if (bin.length === 24) {
                    const degrees = BinOperator.ParseBinValue(bin.slice(0, 8), 'Rational', littleEndian) as number
                    const minutes = BinOperator.ParseBinValue(bin.slice(8, 16), 'Rational', littleEndian) as number
                    const seconds = BinOperator.ParseBinValue(bin.slice(16, 24), 'Rational', littleEndian) as number
                    // return `${degrees},${minutes},${seconds}`
                    return degrees + (minutes / 60) + (seconds / 360)
                }

            }
            case 'Undefined':
            case 'Ascii':
            case 'Comment': {
                return BinOperator.GetBinString(bin)
            }
            case 'IFD':
            case 'Byte':
            case 'Short':
            case 'Long':
            case 'Long8':
                return BinOperator.GetBinNumber(bin, littleEndian)
            case 'SByte':
            case 'SShort':
            case 'SLong':
            case 'SLong8': {
                const bitLen = bin.length * 8
                const num = BinOperator.GetBinNumber(bin, littleEndian)
                // 判断正负，0表示符号位置为0，是正数
                if ((num & Math.pow(2, bitLen - 1)) === 0) {
                    return num
                }
                return num - Math.pow(2, bitLen)
            }
            // case 'SFloat': {
            //     const num = BinOperator.GetBinNumber(bin)
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
                if(bin.length < 1) {
                    return 0
                }
                return new DataView(bin.buffer).getFloat32(0, littleEndian)
            }
            case 'Double':
            case 'SDouble':
            case 'SRational': {
                if(bin.length < 1) {
                    return 0
                }
                return new DataView(bin.buffer).getFloat64(0, littleEndian)
            }
        }
    }

    private readonly buffer: Uint8Array
    private readonly arrayBuffer: ArrayBuffer
    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer
        this.buffer = new Uint8Array(arrayBuffer)
    }

    getArrayBuffer() {
        return this.arrayBuffer
    }

    findIndex(pattern: number[] | Uint8Array, startIndex: number = 0) {
        if (pattern.length < 1) {
            return -1
        }
        const idx = this.buffer.slice(startIndex).findIndex((_num, idx, arr) => {
            if (idx + pattern.length > arr.length - 1) {
                return false
            }
            return pattern.every((n, i) => {
                return n === arr[idx + i]
            })
        })
        if (idx < 0) {
            return idx
        } else {
            return idx + startIndex
        }
    }

    slice(start: number, end: number) {
        return this.buffer.slice(start, end)
    }
    sliceBlock(start: number, size: number) {
        return this.slice(start, start + size)
    }

    getString(start: number, end: number, zeroStop: boolean = true) {
        return BinOperator.GetBinString(this.slice(start, end), zeroStop)
    }
    getNumber(start: number, end: number, littleEndian: boolean) {
        return BinOperator.GetBinNumber(this.slice(start, end), littleEndian)
    }
    getHex(start: number, end: number, littleEndian: boolean) {
        return BinOperator.GetBinHex(this.slice(start, end), littleEndian)

    }
}

type TExifSchema = {
    /** Exif start index */
    start: number;
    /** Exif block size without 2 bytes of head */
    size: number;
    /** Exif end index */
    end: number;
    /** Exif string sign */
    sign: string;
    /** Exif data endiab */
    endian: string;
    /** Exif version */
    version: number;
    /** Exif data offset baseline */
    ifdOffset: number;
    /** Exif tag's count */
    tagCount: number;
    /** Exif tag start index */
    tagStart: number;
}

export class ExifOperator extends BinOperator {

    static FindTagHex(nameHex: string, typeHex: string) {
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

    hasExif() {
        const idx = this.findIndex([0xFF, 0xE1])
        if (idx < 0) {
            return false
        }
        // Should be "Exif"
        const sign = this.getString(idx + 4, idx + 8)
        if (sign !== 'Exif') {
            return false
        }
        return true
    }

    getExifSchema(): TExifSchema | null {
        const start = this.findIndex([0xFF, 0xE1])
        if (start < 0) {
            return null
        }
        const endian = this.getString(start + 10, start + 12)
        const littleEndian = endian === 'II'

        // exif block size
        const size = this.getNumber(start + 2, start + 4, false)
        // Should be "Exif"
        const sign = this.getString(start + 4, start + 8)
        if (sign !== 'Exif') {
            return null
        }
        /**
         * - MM(0x4D4D): Big Endian
         * - II(0x4949): Little Endian
         */
        // Exif version
        const version = this.getNumber(start + 12, start + 14, littleEndian)
        const end = start + 2 + size
        const ifdOffset = start + 2 + this.getNumber(start + 14, start + 18, littleEndian)
        const tagCount = this.getNumber(start + 18, start + 20, littleEndian)
        const tagStart = start + 20
        return { start, size, end, sign, endian, version, ifdOffset, tagCount, tagStart }
    }

    getExif() {
        const exif: TExif = {}
        const schema = this.getExifSchema()
        if (!schema) {
            return null
        }
        const littleEndian = schema.endian === 'II'
        this.readIFD(schema.tagStart, schema.tagCount, schema.ifdOffset, littleEndian, tag => {
            Object.assign(exif, tag)
        })
        return exif
    }

    removeExif() {
        const arrBuf = this.getArrayBuffer()
        const schema = this.getExifSchema()
        if(!schema) {
            return [arrBuf]
        }
        const a = arrBuf.slice(0, schema.start)
        const b = arrBuf.slice(schema.end)
        return [a, b]
    }

    private readIFD(start: number, count: number, ifdOffset: number, littleEndian: boolean, callback: (tag: Record<string, string | number>) => void) {
        let s = start
        for (let i = 0; i < count; i++) {
            const bin = this.sliceBlock(s, 12)
            this.parseTag(bin, ifdOffset, littleEndian, callback)
            s += 12
        }
    }

    private parseTag(bin: Uint8Array, ifdOffset: number, littleEndian: boolean, callback: (tag: Record<string, string | number>) => void) {
        const name = BinOperator.GetBinHex(bin.slice(0, 2), littleEndian)
        const type = BinOperator.GetBinHex(bin.slice(2, 4), littleEndian)
        const count = BinOperator.GetBinNumber(bin.slice(4, 8), littleEndian)

        const tag = ExifOperator.FindTagHex(name, type)
        if (!tag) {
            return
        }
        if (typeof tag.size === 'number') {
            const dataSize = tag.size * count
            if (dataSize > 4) {
                const offset = BinOperator.GetBinNumber(bin.slice(8, 12), littleEndian)
                const value = BinOperator.ParseBinValue(this.sliceBlock(ifdOffset + offset, dataSize), tag.type, littleEndian)
                callback({ [tag.key]: value })
            } else {
                const value = BinOperator.ParseBinValue(bin.slice(8, 8 + dataSize), tag.type, littleEndian)
                if (('ExifTag' === tag.key || 'GPSTag' === tag.key) && typeof value === 'number') {
                    const c = BinOperator.GetBinNumber(this.sliceBlock(ifdOffset + value, 2), littleEndian)
                    const s = ifdOffset + value + 2
                    this.readIFD(s, c, ifdOffset, littleEndian, callback)
                } else {
                    callback({ [tag.key]: value })
                }
            }
        } else {
            const offset = BinOperator.GetBinNumber(bin.slice(8, 12), littleEndian)
            const value = BinOperator.GetBinString(this.sliceBlock(ifdOffset + offset, count))
            if (value) {
                callback({ [tag.key]: value })
            }
        }
    }
}