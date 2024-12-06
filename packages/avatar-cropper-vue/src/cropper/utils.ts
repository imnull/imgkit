export const calContainSize = (W: number, H: number, r: number = 1, padding: number = 0) => {
    const R = W / H
    if (R < r) {
        const width = W - padding * 2
        const height = Math.floor(width / r)
        const offsetX = padding
        const offsetY = (H - height) / 2
        return {
            width,
            height,
            left: offsetX,
            top: offsetY,
            right: W - offsetX,
            bottom: H - offsetY,
            position: 0,
        }
    } else {
        const height = H - padding * 2
        const width = Math.floor(height * r)
        const offsetX = (W - width) / 2
        const offsetY = padding
        return {
            width,
            height,
            left: offsetX,
            top: offsetY,
            right: W - offsetX,
            bottom: H - offsetY,
            position: 1,
        }
    }
}

export const calCoverSize = (W: number, H: number, r: number = 1, padding: number = 0) => {
    const R = W / H
    if (R > r) {
        const width = W - padding * 2
        const height = Math.floor(width / r)
        const offsetX = padding
        const offsetY = (H - height) * .5
        return {
            width,
            height,
            left: offsetX,
            top: offsetY,
            right: W - offsetX,
            bottom: H - offsetY,
            position: 0,
        }
    } else {
        const height = H - padding * 2
        const width = Math.floor(height * r)
        const offsetX = (W - width) / 2
        const offsetY = padding
        return {
            width,
            height,
            left: offsetX,
            top: offsetY,
            right: W - offsetX,
            bottom: H - offsetY,
            position: 1,
        }
    }
}

export const calClipPath = (width: number, height: number, rect: { left: number; right: number; top: number; bottom: number; }) => {
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

export const loadImage = (src: string | Blob) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
        resolve(image)
    })
    image.addEventListener('error', err => {
        reject(err)
    })
    if (src instanceof Blob) {
        readAsDataURL(src).then(dataUrl => {
            image.src = dataUrl
        }, reject)
    } else {
        image.src = src
    }
})

export const getEventNames = () => {
    if ('ontouchstart' in document) {
        return {
            mousedown: 'touchstart',
            mousemove: 'touchmove',
            mouseup: 'touchend',
        }
    } else {
        return {
            mousedown: 'mousedown',
            mousemove: 'mousemove',
            mouseup: 'mouseup',
        }
    }
}

export const getEventPoints = (e: TouchEvent): { x: number; y: number }[] => {
    if (e.touches) {
        const arr = Array.from(e.touches).map(ev => ({ x: ev.clientX, y: ev.clientY })).slice(0, 2)
        // arr.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        return arr
    } else {
        const _e = e as unknown as MouseEvent
        return [{ x: _e.clientX, y: _e.clientY }]
    }
}

export const calDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const x = b.x - a.x
    const y = b.y - a.y
    return Math.sqrt(x * x + y * y)
}

export const readAsDataURL = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        resolve(reader.result as string)
    })
    reader.addEventListener('error', err => {
        reject(err)
    })
    reader.readAsDataURL(blob)
})

export const toBlob = (canvas: HTMLCanvasElement, type: string = 'image/jpeg', quality: number = 0.8) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(res => {
        if (!res) {
            reject('Canvas to-blob failed')
        } else {
            resolve(res)
        }
    }, type, quality)
})

type TSize = { width: number; height: number; }
type TPosition = { left: number; top: number; }

type TCropOptions = {
    /**
     * ### 裁切视口像素尺寸
     */
    viewport: TSize;
    /** 
     * ### 以视口尺寸为基准的`cover`模式图片尺寸
     * **1:1尺寸，不带`zoom`值**
     * */
    cover: TSize;
    /**
     * ### 图片偏移
     * 以transform方式进行移动，初始位置css居中，值为`left:0; top:0`
     */
    offset: TPosition;
    /**
     * ### 旋转角度
     * 整数，0 ~ 3，相当于 rotate(rotate * 90deg)
     */
    rotate: number;
    /**
     * ### 相对`viewport`的缩放倍数
     */
    zoom: number;
    /**
     * ### 图片真实尺寸像素
     */
    imageSize: TSize;
}

export const calCropResult = (options: TCropOptions) => {
    const rotate = options.rotate % 4
    const {
        zoom,
        imageSize,
        viewport,
        cover,
        offset,
    } = options

    const offX = (cover.width * zoom - viewport.width) * .5 - (offset.left * zoom)
    const offY = (cover.height * zoom - viewport.height) * .5 - (offset.top * zoom)

    const scale = imageSize.width / (cover.width * zoom)

    const size = [viewport.width * scale, viewport.height * scale]
    if (rotate % 2 === 1) {
        size.reverse()
    }

    return {
        rotate,
        left: offX * scale,
        top: offY * scale,
        width: size[0],
        height: size[1],
    }
}

export const renderCropImage = async (src: string | Blob, options: TCropOptions) => {
    const rect = calCropResult(options)
    const w = options.viewport.width
    const h = options.viewport.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.translate(w / 2, h / 2)
    const sourceRect = [rect.left, rect.top, rect.width, rect.height]
    const distanceRect = rect.rotate % 2 === 1 ? [h / -2, w / -2, h, w] : [w / -2, h / -2, w, h]
    ctx.rotate(-.5 * rect.rotate * Math.PI)
    const image = await loadImage(src)
    ctx.drawImage(image
        , sourceRect[0], sourceRect[1], sourceRect[2], sourceRect[3]
        , distanceRect[0], distanceRect[1], distanceRect[2], distanceRect[3]
    )

    if(src instanceof File) {
        const result = await toBlob(canvas, src.type)
        const file = new File([result], src.name)
        return file
    } else {
        const result = await toBlob(canvas)
        return result
    }
}