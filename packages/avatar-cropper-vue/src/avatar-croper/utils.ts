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

export const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
        resolve(image)
    })
    image.addEventListener('error', err => {
        reject(err)
    })
    image.src = src
})

export const getEventNames = () => {
    if('ontouchstart' in document) {
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
    if(e.touches) {
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