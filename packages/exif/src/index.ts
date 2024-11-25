import { GetBinString, GetBinNumber, GetBinHex, ParseBinValue, FindTagHex } from './utils'

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
        return GetBinString(this.slice(start, end), zeroStop)
    }
    getNumber(start: number, end: number, littleEndian: boolean) {
        return GetBinNumber(this.slice(start, end), littleEndian)
    }
    getHex(start: number, end: number, littleEndian: boolean) {
        return GetBinHex(this.slice(start, end), littleEndian)

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
        const endian = this.getString(start + 10, start + 12)
        const littleEndian = endian === 'II'

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
        const name = GetBinHex(bin.slice(0, 2), littleEndian)
        const type = GetBinHex(bin.slice(2, 4), littleEndian)
        const count = GetBinNumber(bin.slice(4, 8), littleEndian)

        const tag = FindTagHex(name, type)
        if (!tag) {
            return
        }
        if (typeof tag.size === 'number') {
            const dataSize = tag.size * count
            if (dataSize > 4) {
                const offset = GetBinNumber(bin.slice(8, 12), littleEndian)
                const value = ParseBinValue(this.sliceBlock(ifdOffset + offset, dataSize), tag.type, littleEndian)
                callback({ [tag.key]: value })
            } else {
                const value = ParseBinValue(bin.slice(8, 8 + dataSize), tag.type, littleEndian)
                if (('ExifTag' === tag.key || 'GPSTag' === tag.key) && typeof value === 'number') {
                    const c = GetBinNumber(this.sliceBlock(ifdOffset + value, 2), littleEndian)
                    const s = ifdOffset + value + 2
                    this.readIFD(s, c, ifdOffset, littleEndian, callback)
                } else {
                    callback({ [tag.key]: value })
                }
            }
        } else {
            const offset = GetBinNumber(bin.slice(8, 12), littleEndian)
            const value = GetBinString(this.sliceBlock(ifdOffset + offset, count))
            if (value) {
                callback({ [tag.key]: value })
            }
        }
    }
}