import { TPoint, TRect } from './type'
import {
    CalBox,
    CalClipPath,
    CalDistance,
    CanvasToBlob,
    GetEventPoints,
    LoadImage,
} from './utils'

export class ImageCropper {

    private readonly viewport: TRect
    private readonly wrapper: TRect
    private readonly imageWidth: number
    private readonly imageHeight: number

    private zoom: number
    private left: number
    private top: number
    private points: TPoint[]


    private snapZoom: number
    private snapLeft: number
    private snapTop: number
    private snapPoints: TPoint[]

    private rotate: number
    private minZoom: number
    private maxZoom: number

    constructor(options: {
        viewportRatio?: number;
        viewportPadding?: number;
        imageWidth: number;
        imageHeight: number;
    }) {
        const {
            viewportRatio = 1,
            viewportPadding = 20,
            imageWidth,
            imageHeight,
        } = options
        this.viewport = CalBox('contain', window.innerWidth, window.innerHeight, viewportRatio, viewportPadding)
        this.wrapper = CalBox('cover', this.viewport.width, this.viewport.height, imageWidth / imageHeight, 0)
        this.imageWidth = imageWidth
        this.imageHeight = imageHeight

        this.zoom = 1
        this.rotate = 0
        this.left = 0
        this.top = 0
        this.points = []

        this.snapZoom = this.zoom
        this.snapLeft = this.left
        this.snapTop = this.top
        this.snapPoints = this.points

        this.minZoom = 1
        this.maxZoom = 20
    }

    snap() {
        this.snapZoom = this.zoom
        this.snapLeft = this.left
        this.snapTop = this.top
        this.snapPoints = Array.isArray(this.points) ? [...this.points] : []
    }

    snapEvent(e: any) {
        this.points = GetEventPoints(e)
        this.snap()
    }

    setPoints(points: TPoint[]) {
        this.points = points
    }

    get minLeft() {
        const rotate = this.rotate % 4
        let dim = this.viewport.width
        if (rotate % 2 === 1) {
            dim = this.viewport.height
        }
        return (dim - this.wrapper.width * this.zoom) / 2 / this.zoom
    }

    get maxLeft() {
        const rotate = this.rotate % 4
        let dim = this.viewport.width
        if (rotate % 2 === 1) {
            dim = this.viewport.height
        }
        return (this.wrapper.width * this.zoom - dim) / 2 / this.zoom
    }

    get minTop() {
        const rotate = this.rotate % 4
        let dim = this.viewport.height
        if (rotate % 2 === 1) {
            dim = this.viewport.width
        }
        return (dim - this.wrapper.height * this.zoom) / 2 / this.zoom
    }

    get maxTop() {
        const rotate = this.rotate % 4
        let dim = this.viewport.height
        if (rotate % 2 === 1) {
            dim = this.viewport.width
        }
        return (this.wrapper.height * this.zoom - dim) / 2 / this.zoom
    }

    calLeft(offset: number) {
        const rotate = this.rotate % 4
        const sign = rotate === 1 || rotate === 2 ? -1 : 1
        this.left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + offset * sign / this.zoom))
    }

    calTop(offset: number) {
        const rotate = this.rotate % 4
        const sign = rotate === 2 || rotate === 3 ? -1 : 1
        this.top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + offset * sign / this.zoom))
    }

    calZoom(offset: number) {
        const zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.snapZoom * offset))
        this.zoom = zoom
        this.calLeft(0)
        this.calTop(0)
    }

    calRotate(offset: number) {
        this.rotate += offset
        this.calLeft(0)
        this.calTop(0)
    }

    calPosition(p: TPoint, o: TPoint) {
        const x = p.x - o.x
        const y = p.y - o.y
        if (this.rotate % 2 === 1) {
            this.calLeft(y)
            this.calTop(x)
        } else {
            this.calLeft(x)
            this.calTop(y)
        }
    }

    resolvePoints() {
        if (this.snapPoints.length === 1 && this.points.length > 0) {
            const [o] = this.snapPoints
            const [p] = this.points
            this.calPosition(p, o)
        } else if (this.snapPoints.length === 2 && this.points.length > 1) {
            const [a1, a2] = this.snapPoints
            const [b1, b2] = this.points
            this.calZoom(CalDistance(b1, b2) / CalDistance(a1, a2))
            const o: TPoint = { x: (a1.x + a2.x) * .5, y: (a1.y + a2.y) * .5 }
            const p: TPoint = { x: (b1.x + b2.x) * .5, y: (b1.y + b2.y) * .5 }
            this.calPosition(p, o)
        }
    }

    resolveEventPoints(e: any) {
        this.points = GetEventPoints(e)
        this.resolvePoints()
    }

    get Left() {
        return this.left
    }

    get Top() {
        return this.top
    }

    get Zoom() {
        return this.zoom
    }

    get Rotate() {
        return this.rotate
    }

    get debugCode() {
        return JSON.stringify({
            points: this.points,
            left: this.left,
            top: this.top,
            zoom: this.zoom,
            rotate: ((this.rotate % 4) * -90) + 'deg',
        }, null, '  ')
    }

    async crop(src: string | Blob) {
        const rotate = this.rotate % 4
        const cover = this.wrapper
        const zoom = this.zoom
        const viewport = this.viewport

        const offX = (cover.width * zoom - viewport.width) * .5 - (this.left * zoom)
        const offY = (cover.height * zoom - viewport.height) * .5 - (this.top * zoom)

        const scale = this.imageWidth / (cover.width * zoom)

        const size = [viewport.width * scale, viewport.height * scale]
        if (rotate % 2 === 1) {
            size.reverse()
        }

        const rect = {
            rotate,
            left: offX * scale,
            top: offY * scale,
            width: size[0],
            height: size[1],
        }

        const w = viewport.width
        const h = viewport.height
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.translate(w / 2, h / 2)
        const sourceRect = [rect.left, rect.top, rect.width, rect.height]
        const distanceRect = rect.rotate % 2 === 1 ? [h / -2, w / -2, h, w] : [w / -2, h / -2, w, h]
        ctx.rotate(-.5 * rect.rotate * Math.PI)
        const image = await LoadImage(src)
        ctx.drawImage(image
            , sourceRect[0], sourceRect[1], sourceRect[2], sourceRect[3]
            , distanceRect[0], distanceRect[1], distanceRect[2], distanceRect[3]
        )

        if (src instanceof File) {
            const result = await CanvasToBlob(canvas, src.type)
            const file = new File([result], src.name)
            return file
        } else {
            const result = await CanvasToBlob(canvas)
            return result
        }
    }

    get WrapperCssText() {
        const wrapper = this.wrapper
        const viewport = this.viewport
        return `width:${wrapper.width}px;height:${wrapper.height}px;left:${wrapper.left + viewport.left}px;top:${wrapper.top + viewport.top}px;`;
    }

    get RotateCssText() {
        return `transform:rotate(${this.Rotate * -90}deg);`
    }

    get ZoomCssText() {
        return `transform:scale(${this.Zoom});`
    }

    get ImageCssText() {
        const x = this.Left
        const y = this.Top
        return `transform:translateX(${this.Left}px) translateY(${this.Top}px);`
    }

    get MaskCssText() {
        const clipPath = CalClipPath(window.innerWidth, window.innerHeight, this.viewport)
        return `clip-path:path('${clipPath}');`
    }
}