import { ExifOperator, TExif, TExifForce } from "./exif"
import { exifHasOrientation, exifHasSize, getCropRectCover, isValidNumber, readAsDataURL } from "./utils"

export const webCreateImageByUrl = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.addEventListener('load', () => {
        resolve(image)
    })
    image.addEventListener('error', err => {
        reject(err)
    })
    image.setAttribute('src', src)
})

export const webCanvasToBlob = (canvas: HTMLCanvasElement, type?: string, quality?: any) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
        if (!blob) {
            reject('Canvas to Blob failed')
        } else {
            resolve(blob)
        }
    }, type, quality)
})

export const webCompressImage = async (blob: Blob, sub: number) => {
    const dataUrl = await readAsDataURL(blob)
    const image = await webCreateImageByUrl(dataUrl)
    const w = (image.width / sub) >> 0
    const h = (image.height / sub) >> 0

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image
        , 0, 0, image.width, image.height
        , 0, 0, w, h
    )

    const result = await webCanvasToBlob(canvas, 'image/jpeg', 1)
    console.log(`[CompressImage] sub=${sub} from [${image.width} * ${image.height}] ${blob.size} to [${w} * ${h}] ${result.size}`)

    return {
        blob: result,
        width: w,
        height: h,
    }
}

const adjustSub = (val: number, min: number = 1.1, max: number = 1.4) => {
    return Math.max(min, Math.min(max, val))
}

export const webCompressImageLimit = async (blob: Blob, limit: number = 800 * 1000) => {
    if (blob.size <= limit) {
        const dataUrl = await readAsDataURL(blob)
        const img = await webCreateImageByUrl(dataUrl)
        return {
            blob,
            width: img.width,
            height: img.height,
        }
    }
    let sub = adjustSub(blob.size / limit)
    let result = await webCompressImage(blob, sub)

    let c = 0
    while (result.blob.size > limit) {
        if (++c > 100) {
            break
        }
        sub *= adjustSub(result.blob.size / limit)
        result = await webCompressImage(blob, sub)
    }
    return result
}

export const webCropImage = async (file: Blob, width: number, height: number) => {
    const dataUrl = await readAsDataURL(file)
    const image = await webCreateImageByUrl(dataUrl)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const sRect = getCropRectCover(image.width, image.height, width / height)

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image
        , sRect.left, sRect.top, sRect.width, sRect.height
        , 0, 0, canvas.width, canvas.height
    )

    const result = await webCanvasToBlob(canvas, 'image/jpeg', 1)
    console.log(`[CropImage] from [${image.width} * ${image.height}] ${file.size} to [${width} * ${height}] ${result.size}`)

    return {
        blob: result,
        width,
        height,
    }
}

export const webRequestImageBlob = (url: string) => new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                resolve(xhr.response as Blob)
            } else {
                reject(`XHR failed: ${xhr.status}`)
            }
        }
    })
    xhr.send()
})


const needRebuild = (exif: TExif): exif is TExifForce => {
    return exifHasOrientation(exif) && exifHasSize(exif) && exif.Orientation! > 1
}

const getExifSize = (exif: TExif): [number, number] => {
    if (isValidNumber(exif.ImageWidth) && (isValidNumber(exif.ImageLength) || isValidNumber(exif.ImageHeight))) {
        return [exif.ImageWidth, isValidNumber(exif.ImageLength) ? exif.ImageLength : exif.ImageHeight] as [number, number]
    } else if (isValidNumber(exif.PixelXDimension) && isValidNumber(exif.PixelYDimension)) {
        return [exif.PixelXDimension, exif.PixelYDimension]
    } else {
        throw 'The EXIF has no size infomations.'
    }
}

export const webRebuildImage = async (blob: Blob) => {
    const arrBuf = await blob.arrayBuffer()
    const exifOp = new ExifOperator(arrBuf)
    const exif = exifOp.getExif()
    if (!exif) {
        return blob
    }
    if (!needRebuild(exif)) {
        const segs = exifOp.removeExif()
        if (blob instanceof File) {
            return new File(segs, blob.name, { type: blob.type })
        } else {
            return new Blob(segs, { type: blob.type })
        }
    }

    const scale = [1, 1]
    const size = getExifSize(exif)
    const canvasSize = [...size] as [number, number]
    let rotate = 0

    switch (exif.Orientation) {
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
    if (Math.abs(rotate) % 2 === 1) {
        canvasSize.reverse()
    }

    const segments = exifOp.removeExif()
    const cleanBlob = new Blob(segments, { type: blob.type })
    const dataUrl = await readAsDataURL(cleanBlob)
    const image = await webCreateImageByUrl(dataUrl)
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
    const dataUrlNew = canvas.toDataURL(blob.type)
    const res = await webCanvasToBlob(canvas, blob.type)
    if (blob instanceof File) {
        return new File([res], blob.name, { type: blob.type })
    }
    return res
}