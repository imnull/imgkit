import { TPoint, TRect } from "./type"

export const CalBox = (type: 'contain' | 'cover', W: number, H: number, boxRatio: number, padding: number): TRect => {
    const R = W / H
    if ((R < boxRatio && type === 'contain') || (R > boxRatio && type === 'cover')) {
        const width = W - padding * 2
        const height = Math.floor(width / boxRatio)
        const left = padding
        const top = (H - height) * .5
        return {
            width,
            height,
            left,
            top,
            right: left + width,
            bottom: top + height,
        }
    } else {
        const height = H - padding * 2
        const width = Math.floor(height * boxRatio)
        const left = (W - width) * .5
        const top = padding
        return {
            width,
            height,
            left,
            top,
            right: left + width,
            bottom: top + height,
        }
    }
}

export const CalDistance = (a: TPoint, b: TPoint) => {
    const x = b.x - a.x
    const y = b.y - a.y
    return Math.sqrt(x * x + y * y)
}

export const GetEventPoints = (e: any): TPoint[] => {
    if (!e) {
        return []
    }
    if (e.touches && e.touches.length) {
        const arr = Array.from(e.touches).map((ev: any) => ({ x: ev.clientX, y: ev.clientY })).slice(0, 2)
        return arr
    } else if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
        return [{ x: e.clientX, y: e.clientY }]
    } else {
        return []
    }
}

export const ReadAsDataURL = (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            resolve(reader.result as string)
        })
        reader.addEventListener('error', err => {
            reject(err)
        })
        reader.readAsDataURL(blob)
    })
}

export const LoadImage = (src: string | Blob) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => {
            resolve(image)
        })
        image.addEventListener('error', err => {
            reject(err)
        })
        if (src instanceof Blob) {
            ReadAsDataURL(src).then(dataUrl => {
                image.src = dataUrl
            }, reject)
        } else {
            image.src = src
        }
    })
}

export const CanvasToBlob = (canvas: HTMLCanvasElement, type: string = 'image/jpeg', quality: number = 0.8) => {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(res => {
            if (!res) {
                reject('Canvas to-blob failed')
            } else {
                resolve(res)
            }
        }, type, quality)
    })
}

export const CalClipPath = (width: number, height: number, rect: TRect) => {
    const steps: string[] = []
    steps.push(`M${0} ${0}`) // left top
    steps.push(`L${width} ${0}`) // right top
    steps.push(`L${width} ${height}`) // right bottom
    steps.push(`L${0} ${height}`) // left bottom

    steps.push(`L${0} ${rect.bottom}`)
    steps.push(`L${rect.right} ${rect.bottom}`) // innert right bottom
    steps.push(`L${rect.right} ${rect.top}`) // innert right top
    steps.push(`L${rect.left} ${rect.top}`) // innert left top
    steps.push(`L${rect.left} ${rect.bottom}`) // innert left bottom
    steps.push(`L${0} ${rect.bottom}`) // innert return
    steps.push(`L${0} ${0}`)

    // steps.push(`Z`)
    return steps.join(' ')
}