import { getCropRectCover, readAsDataURL } from "./utils"

export const webCreateImageByUrl = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
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
        if(!blob) {
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
    if(blob.size <= limit) {
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
    while(result.blob.size > limit) {
        if(++c > 100) {
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
        if(xhr.readyState === 4) {
            if(xhr.status < 300 && xhr.status >= 200) {
                resolve(xhr.response as Blob)
            } else {
                reject(`XHR failed: ${xhr.status}`)
            }
        }
    })
    xhr.send()
})