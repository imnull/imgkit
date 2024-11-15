const TYPE_MAP = [
    {
        typeCode: "0x0001",
        typeName: "unsigned byte",
        size: 1,
        description: "无符号字节"
    },
    {
        typeCode: "0x0002",
        typeName: "ascii strings",
        size: 'var',
        description: "ASCII字符串 (长度可变)"
    },
    {
        typeCode: "0x0003",
        typeName: "unsigned short",
        size: 2,
        description: "无符号短整型"
    },
    {
        typeCode: "0x0004",
        typeName: "unsigned long",
        size: 4,
        description: "无符号长整型"
    },
    {
        typeCode: "0x0005",
        typeName: "unsigned rational",
        size: 8,
        description: "无符号有理数 (2个4字节整数)"
    },
    {
        typeCode: "0x0006",
        typeName: "signed byte",
        size: 1,
        description: "有符号字节"
    },
    {
        typeCode: "0x0007",
        typeName: "undefined",
        size: 1,
        description: "未定义类型"
    },
    {
        typeCode: "0x0008",
        typeName: "signed short",
        size: 2,
        description: "有符号短整型"
    },
    {
        typeCode: "0x0009",
        typeName: "signed long",
        size: 4,
        description: "有符号长整型"
    },
    {
        typeCode: "0x000A",
        typeName: "signed rational",
        size: 8,
        description: "有符号有理数 (2个4字节整数)"
    },
    {
        typeCode: "0x000B",
        typeName: "single float",
        size: 4,
        description: "单精度浮点数"
    },
    {
        typeCode: "0x000C",
        typeName: "double float",
        size: 8,
        description: "双精度浮点数"
    }
]

const TAG_MAP = [
    {
        tag_id: "0x0100",
        typeName: "ImageWidth"
    },
    {
        tag_id: "0x0101",
        typeName: "ImageHeight"
    },
    {
        tag_id: "0x0102",
        typeName: "BitsPerSample"
    },
    {
        tag_id: "0x0103",
        typeName: "Compression"
    },
    {
        tag_id: "0x0106",
        typeName: "PhotometricInterpretation"
    },
    {
        tag_id: "0x0111",
        typeName: "StripOffsets"
    },
    {
        tag_id: "0x0112",
        typeName: "Orientation"
    },
    {
        tag_id: "0x0115",
        typeName: "SamplesPerPixel"
    },
    {
        tag_id: "0x0116",
        typeName: "RowsPerStrip"
    },
    {
        tag_id: "0x0117",
        typeName: "StripByteCounts"
    },
    {
        tag_id: "0x011A",
        typeName: "XResolution"
    },
    {
        tag_id: "0x011B",
        typeName: "YResolution"
    },
    {
        tag_id: "0x011C",
        typeName: "PlanarConfiguration"
    },
    {
        tag_id: "0x0128",
        typeName: "ResolutionUnit"
    },
    {
        tag_id: "0x0200",
        typeName: "JPEGInterchangeFormat"
    },
    {
        tag_id: "0x0201",
        typeName: "JPEGInterchangeFormatLength"
    },
    {
        tag_id: "0x0211",
        typeName: "YCbCrCoefficients"
    },
    {
        tag_id: "0x0212",
        typeName: "YCbCrSubSampling"
    },
    {
        tag_id: "0x0213",
        typeName: "YCbCrPositioning"
    },
    {
        tag_id: "0x0214",
        typeName: "ReferenceBlackWhite"
    },
    {
        tag_id: "0x8298",
        typeName: "Copyright"
    },
    {
        tag_id: "0x8769",
        typeName: "ExifIFDPointer"
    },
    {
        tag_id: "0x8825",
        typeName: "GPSInfoIFDPointer"
    },
    {
        tag_id: "0xA000",
        typeName: "FlashpixVersion"
    },
    {
        tag_id: "0xA001",
        typeName: "ColorSpace"
    },
    {
        tag_id: "0xA002",
        typeName: "PixelXDimension"
    },
    {
        tag_id: "0xA003",
        typeName: "PixelYDimension"
    },
    {
        tag_id: "0xA004",
        typeName: "RelatedSoundFile"
    },
    {
        tag_id: "0xA005",
        typeName: "InteroperabilityIFDPointer"
    },
    {
        tag_id: "0xA400",
        typeName: "FlashEnergy"
    },
    {
        tag_id: "0xA401",
        typeName: "SpatialFrequencyResponse"
    },
    {
        tag_id: "0xA402",
        typeName: "FocalPlaneXResolution"
    },
    {
        tag_id: "0xA403",
        typeName: "FocalPlaneYResolution"
    },
    {
        tag_id: "0xA404",
        typeName: "FocalPlaneResolutionUnit"
    },
    {
        tag_id: "0xA405",
        typeName: "SubjectLocation"
    },
    {
        tag_id: "0xA406",
        typeName: "ExposureIndex"
    },
    {
        tag_id: "0xA407",
        typeName: "SensingMethod"
    },
    {
        tag_id: "0xA408",
        typeName: "FileSource"
    },
    {
        tag_id: "0xA409",
        typeName: "SceneType"
    },
    {
        tag_id: "0xA40A",
        typeName: "CFAPattern"
    },
    {
        tag_id: "0xA40B",
        typeName: "CustomRendered"
    },
    {
        tag_id: "0xA40C",
        typeName: "ExposureMode"
    },
    {
        tag_id: "0xA40D",
        typeName: "WhiteBalance"
    },
    {
        tag_id: "0xA40E",
        typeName: "DigitalZoomRatio"
    },
    {
        tag_id: "0xA40F",
        typeName: "FocalLengthIn35mmFilm"
    },
    {
        tag_id: "0xA410",
        typeName: "SceneCaptureType"
    },
    {
        tag_id: "0xA411",
        typeName: "GainControl"
    },
    {
        tag_id: "0xA412",
        typeName: "Contrast"
    },
    {
        tag_id: "0xA413",
        typeName: "Saturation"
    },
    {
        tag_id: "0xA414",
        typeName: "Sharpness"
    },
    {
        tag_id: "0xA415",
        typeName: "DeviceSettingDescription"
    },
    {
        tag_id: "0xA416",
        typeName: "SubjectDistanceRange"
    },
    {
        tag_id: "0xA420",
        typeName: "ImageUniqueID"
    }
]

const TYPE_CONVERTOR: Record<string, (bin: Uint8Array) => string | number> = {
    '0005': (bin: Uint8Array) => {
        const a = convNum(bin.slice(0, 4))
        const b = convNum(bin.slice(4))
        if (b === 1) {
            return a
        }
        return a / b
    },
    '0003': (bin: Uint8Array) => {
        return convNum(bin)
    },
    '0004': (bin: Uint8Array) => {
        return convNum(bin)
    },
    '0002': (bin: Uint8Array) => {
        return convStr(bin)
    },
}

const isNil = (v: unknown) => typeof v === 'undefined' || v === null || (typeof v === 'string' && v.length < 1) || (typeof v === 'number' && isNaN(v))
const isValidNumber = (v: unknown): v is number => typeof v === 'number' && !isNaN(v)

const convStr = (buf: Uint8Array) => {
    return Array.from(buf).map(c => c === 0 ? '' : String.fromCharCode(c)).join('')
}

const convX16 = (buf: Uint8Array) => {
    const x16s = Array.from(buf).map(c => c.toString(16).toUpperCase().padStart(2, '0')).join('')
    return x16s
}

const convNum = (buf: Uint8Array) => {
    const x16s = Array.from(buf).map(c => c.toString(16).toUpperCase().padStart(2, '0')).join('')
    return parseInt(x16s, 16)
}

const parseData = (type: string, bin: Uint8Array) => {
    const m = TYPE_CONVERTOR[type as any]
    if (typeof m === 'function') {
        return m(bin)
    }
    return null
    // return bin
}

const getTypeLen = (type: string) => {
    const item = TYPE_MAP.find(it => it.typeCode.endsWith(type))
    if (item && typeof item.size === 'number') {
        return item.size
    } else {
        return 0
    }
}


const getData = (type: string, count: number, valoff: Uint8Array, ori: Uint8Array, ifdStart: number, IFD_VALUE_OFFSET: number = 4) => {
    const typeLen = getTypeLen(type)
    if (typeLen > 0) {
        const dataLen = typeLen * count
        if (dataLen > IFD_VALUE_OFFSET) {
            const start = ifdStart + convNum(valoff)
            const end = start + dataLen
            return parseData(type, ori.slice(start, end))
        } else {
            return parseData(type, valoff.slice(0, dataLen))
        }
    } else {
        const start = ifdStart + convNum(valoff)
        const end = start + count
        return parseData(type, ori.slice(start, end))
    }
}

const readAsArrayBuffer = (blob: Blob) => new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        resolve(reader.result as ArrayBuffer)
    })
    reader.addEventListener('error', err => {
        reject(err)
    })
    reader.readAsArrayBuffer(blob)
})

const readAsDataURL = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        resolve(reader.result as string)
    })
    reader.addEventListener('error', err => {
        reject(err)
    })
    reader.readAsDataURL(blob)
})

const createImageByUrl = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
        resolve(image)
    })
    image.addEventListener('error', err => {
        reject(err)
    })
    image.setAttribute('src', src)
})

const canvasToBlob = (canvas: HTMLCanvasElement, type?: string, quality?: any) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
        if(!blob) {
            reject('Canvas to Blob failed')
        } else {
            resolve(blob)
        }
    }, type, quality)
})

const readExifSchema = (arrayBuffer: ArrayBuffer) => {
    const buff = new Uint8Array(arrayBuffer)
    const start = buff.findIndex((val, idx, arr) => {
        if (idx >= arr.length - 1) {
            return false
        }
        return val === 0xFF && arr[idx + 1] === 0xE1
    })
    if (start < 0) {
        return null
    }
    const sign = convStr(buff.slice(start + 4, start + 12))
    if (sign.substring(0, 4) !== 'Exif') {
        return null
    }
    // exif版本
    const version = convNum(buff.slice(start + 12, start + 14))
    const IFDStart = start + 2 + convNum(buff.slice(start + 14, start + 18))
    const size = ((buff[start + 2] << 8) | buff[start + 3])
    const end = start + 2 + size
    return { sign, version, start, end, size, blockSize: size - 2, dataStart: start + 18, IFDStart }
}


type TExifForce = {
    ImageWidth: number;
    ImageHeight: number;
    Orientation: number;
}

type TExif = {
    [key in keyof TExifForce]?: number
}


const needRebuild = (exif: TExif): exif is TExifForce => {
    return isValidNumber(exif.Orientation) && exif.Orientation > 1 && isValidNumber(exif.ImageWidth) && isValidNumber(exif.ImageHeight)
}

// Orientation 标签的1至8的值及其对应的具体意义
// 1	正常方向	没有旋转，图片上方对应于设备上方，图片左侧对应于设备左侧
// 2	水平翻转	图片进行了水平翻转（镜像），相当于沿y轴翻转
// 3	旋转180度	图片顺时针旋转了180度
// 4	垂直翻转	图片进行了垂直翻转，相当于沿x轴翻转，同时结合了180度旋转的效果（即先旋转180度再沿x轴翻转，或先沿x轴翻转再旋转180度，结果相同）
// 5	逆时针旋转90度并水平翻转	图片先逆时针旋转90度，然后进行了水平翻转
// 6	顺时针旋转90度	图片顺时针旋转了90度
// 7	逆时针旋转90度并垂直翻转	图片先逆时针旋转90度，然后进行了垂直翻转
// 8	顺时针旋转270度	图片顺时针旋转了270度（相当于逆时针旋转90度）

export const rebuildImage = async (blob: Blob) => {
    const arrBuf = await readAsArrayBuffer(blob)
    const schema = readExifSchema(arrBuf)
    // 如果没有exif信息
    if (!schema) {
        return blob
    }
    const exif = readExifSync(arrBuf)
    if (!needRebuild(exif)) {
        const segs = removeExifSync(arrBuf, schema)
        if(blob instanceof File) {
            return new File(segs, blob.name, { type: blob.type })
        } else {
            return new Blob(segs, { type: blob.type })
        }
        // return blob
    }
    
    const scale = [1, 1]
    let rotate = 0
    switch(exif.Orientation) {
        // 2	水平翻转	图片进行了水平翻转（镜像），相当于沿y轴翻转
        case 2:
            scale[0] = -1
            break
        // 3	旋转180度	图片顺时针旋转了180度
        case 3:
            rotate = 2
            break
        // 4	垂直翻转	图片进行了垂直翻转，相当于沿x轴翻转，同时结合了180度旋转的效果（即先旋转180度再沿x轴翻转，或先沿x轴翻转再旋转180度，结果相同）
        case 4:
            scale[1] = -1
            break
        // 5	逆时针旋转90度并水平翻转	图片先逆时针旋转90度，然后进行了水平翻转
        // 这里因为旋转的90度，操作水平轴向变为纵向才符合预期
        case 5:
            rotate = -1
            scale[1] = -1
            break
        // 6	顺时针旋转90度	图片顺时针旋转了90度
        case 6:
            rotate = 1
            break
        // 7	逆时针旋转90度并垂直翻转	图片先逆时针旋转90度，然后进行了垂直翻转
        // 这里因为旋转的90度，操作垂直轴向变为水平方向才符合预期
        case 7:
            rotate = -1
            scale[0] = -1
            break
        // 8	顺时针旋转270度	图片顺时针旋转了270度（相当于逆时针旋转90度）
        case 8:
            rotate = -1
            break
    }
    const size = [exif.ImageWidth, exif.ImageHeight]
    const canvasSize = [...size]
    if(Math.abs(rotate) % 2 === 1) {
        canvasSize.reverse()
    }

    const segments = removeExifSync(arrBuf, schema)
    const cleanBlob = new Blob(segments, { type: blob.type })
    const dataUrl = await readAsDataURL(cleanBlob)
    const image = await createImageByUrl(dataUrl)
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize[0]
    canvas.height = canvasSize[1]
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rotate * .5 * Math.PI)
    ctx.scale(scale[0], scale[1])
    ctx.drawImage(image
        , 0, 0, image.width, image.height
        , size[0] / -2, size[1] / -2, size[0], size[1]
    )
    const res = await canvasToBlob(canvas, blob.type)
    if(blob instanceof File) {
        return new File([res], blob.name, { type: blob.type })
    }
    return res
}

const removeExifSync = (arrBuf: ArrayBuffer, schema: { start: number, end: number }) => {
    const a = arrBuf.slice(0, schema.start)
    const b = arrBuf.slice(schema.end)
    return [a, b]
}

export const removeExif = async (blob: Blob) => {
    const arrBuf = await readAsArrayBuffer(blob)
    const schema = readExifSchema(arrBuf)
    if (!schema) {
        return blob
    }
    const segments = removeExifSync(arrBuf, schema)
    if (blob instanceof File) {
        return new File(segments, blob.name, { type: blob.type })
    } else {
        return new Blob(segments, { type: blob.type })
    }
}

const readExifSync = (arrayBuffer: ArrayBuffer) => {
    const schema = readExifSchema(arrayBuffer)
    if (!schema) {
        return {}
    }
    const buff = new Uint8Array(arrayBuffer)
    let offset = schema.dataStart
    // Number of Entries
    const num = convNum(buff.slice(offset, offset + 2))
    offset += 2

    const tags: {
        tag: string;
        type: string;
        data: string | number | null;
    }[] = []

    for (let i = 0; i < num; i++) {
        const tag = convX16(buff.slice(offset, offset + 2))
        offset += 2
        const type = convX16(buff.slice(offset, offset + 2))
        offset += 2
        const count = convNum(buff.slice(offset, offset + 4))
        offset += 4
        const valoff = buff.slice(offset, offset + 4)
        offset += 4

        const data = getData(type, count, valoff, buff, schema.IFDStart)
        tags.push({ tag, type, data })
    }

    const exif = tags.map(item => {
        if (isNil(item.data)) {
            return {}
        }
        let name = item.tag
        const tag = TAG_MAP.find(it => it.tag_id.endsWith(item.tag))
        if (tag) {
            name = tag.typeName
        }
        return { [name]: item.data }
    }).reduce((r, v) => ({ ...r, ...v }), {})

    return exif as TExif
}

export const readExif = async (blob: Blob) => {
    const arrayBuffer = await readAsArrayBuffer(blob)
    return readExifSync(arrayBuffer)
}

