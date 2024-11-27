<template>
    <div
        ref="wrapper"
        @contextmenu.prevent="preventDefault"
        class="avatar-croper-wrapper"
    >
        <div class="image-wrapper" :style="wrapperCssText">
            <div class="image-container" :style="containerCssText">
                <canvas
                    ref="canvas"
                    @contextmenu.prevent="preventDefault"
                    :style="imgCssText"
                />
            </div>
        </div>
        <div class="mask" :style="maskCssText"></div>
        <pre v-if="debug" class="debug">{{ debugCode }}</pre>
        <div class="btns">
            <div
                class="btn"
                @touchstart.stop="stopPropagation"
                @click.stop="handleCancel"
            >
                取消
            </div>
            <div class="btn icon" @touchstart.stop="stopPropagation" @click.stop="handleRotate"></div>
            <div
                class="btn"
                @touchstart.stop="stopPropagation"
                @click.stop="handleConfirm"
            >
                确定
            </div>
        </div>
    </div>
</template>
<script lang="js">
import { calClipPath, calContainSize, loadImage, getEventNames, getEventPoints, calDistance, toBlob } from './utils'
export default {
    props: {
        src: {
            type: File,
            default: null
        },
        maxZoom: {
            type: Number,
            default: 1.2
        },
        padding: {
            type: Number,
            default: 10,
        },
        ratio: {
            type: Number,
            default: 1,
        },
        debug: {
            type: Boolean,
            default: false,
        }
    },
    watch: {
        src: {
            handler(val) {
                this.initSrc(val)
            }
        }
    },
    computed: {
        debugCode() {
            return JSON.stringify({
                points: this.points,
                left: this.left,
                top: this.top,
                zoom: this.zoom,
                rotate: ((this.rotate % 4) * -90) + 'deg',
            }, null, '  ')
        },
        wrapperCssText() {
            const size = Math.max(this.pxWidth, this.pxHeight)
            const left = (window.innerWidth - size) / 2
            const top = (window.innerHeight - size) / 2
            return `width:${size}px;height:${size}px;left:${left}px;top:${top}px;`
        },
        containerCssText() {
            return ``
            + `transform:scale(${this.zoom}) rotate(${this.rotate * -90}deg);`
        },
        imgCssText() {
            const x = this.left / this.zoom
            const y = this.top / this.zoom
            return `width:${this.pxWidth}px;height:${this.pxHeight}px;transform:translateX(${x}px) translateY(${y}px)`
        },
        minLeft() {
            if(!this.viewport) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.width
            if(rotate % 2 === 1) {
                dim = this.viewport.height
            }
            return (dim - this.pxWidth * this.zoom) / 2
        },
        maxLeft() {
            if(!this.viewport) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.width
            if(rotate % 2 === 1) {
                dim = this.viewport.height
            }
            return (this.pxWidth * this.zoom - dim) / 2
        },
        minTop() {
            if(!this.viewport) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.height
            if(rotate % 2 === 1) {
                dim = this.viewport.width
            }
            return (dim - this.pxHeight * this.zoom) / 2
        },
        maxTop() {
            if(!this.viewport) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.height
            if(rotate % 2 === 1) {
                dim = this.viewport.width
            }
            return (this.pxHeight * this.zoom - dim) / 2
        },
    },
    data() {
        return {
            viewport: null,
            maskCssText: '',
            left: 0,
            top: 0,
            zoom: 1,
            points: [],
            snapLeft: 0,
            snapTop: 0,
            snapZoom: 1,
            snapPoints: [],
            pxWidth: 0,
            pxHeight: 0,
            minZoom: 1,
            rotate: 0,
        }
    },
    methods: {
        drawCanvas(img) {
            const canvas = this.$refs.canvas
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
        },
        clearCanvas() {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        },
        async initSrc(src) {
            this.viewport = calContainSize(window.innerWidth, window.innerHeight, this.ratio, this.padding)
            const clipPath = calClipPath(window.innerWidth, window.innerHeight, this.viewport)
            this.maskCssText = `clip-path:path('${clipPath}');`

            if(!src) {
                this.clearCanvas()
                this.left = 0
                this.top = 0
            } else {
                loadImage(src).then(img => {
                    this.drawCanvas(img)
                    this.pxWidth = img.width
                    this.pxHeight = img.height
                    this.minZoom = Math.max(this.viewport.width / img.width, this.viewport.height / img.height)
                    this.zoom = this.minZoom
                    this.zoom = 0.2
                    this.left = 0
                    this.top = 0
                })
            }
        },
        snap() {
            this.snapLeft = this.left
            this.snapTop = this.top
            this.snapZoom = this.zoom
            this.snapPoints = this.points.slice(0)
        },
        getMaxLeft() {
            if(!this.viewport) {
                return 0
            }
            const rotate = this.rotate % 4
            if(rotate === 1) {
                return (this.pxHeight * this.zoom - this.viewport.width) / 2
            } else {
                return (this.pxWidth * this.zoom - this.viewport.width) / 2
            }
        },
        calLeft(offset) {
            const rotate = this.rotate % 4
            const sign = rotate === 1 || rotate === 2 ? -1 : 1
            this.left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + offset * sign))
        },
        
        calTop(offset) {
            const rotate = this.rotate % 4
            const sign = rotate === 2 || rotate === 3 ? -1 : 1
            this.top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + offset * sign))
        },
        calPosition(p, o) {
            const x = p.x - o.x
            const y = p.y - o.y
            if(this.rotate % 2 === 1) {
                this.calLeft(y)
                this.calTop(x)
            } else {
                this.calLeft(x)
                this.calTop(y)
            }
        },
        calZoom(offset) {
            const zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.snapZoom * offset))
            this.zoom = zoom
        },
        resolveMouseMove() {
            if(this.snapPoints.length === 1 && this.points.length > 0) {
                const [o] = this.snapPoints
                const [p] = this.points
                this.calPosition(p, o)
            } else if(this.snapPoints.length === 2 && this.points.length > 1) {
                const [a1, a2] = this.snapPoints
                const [b1, b2] = this.points
                this.calZoom(calDistance(b1, b2) / calDistance(a1, a2))
            }
        },
        initEvents() {
            const wrapper = this.$refs.wrapper
            if(!wrapper) {
                return
            }
            const names = getEventNames()
            const mousedown = e => {
                this.points = getEventPoints(e)
                this.snap()
                document.addEventListener(names.mousemove, mousemove)
                document.addEventListener(names.mouseup, mouseup)
            }
            const mousemove = e => {
                this.points = getEventPoints(e)
                this.resolveMouseMove()
            }
            const mouseup = e => {
                this.points = getEventPoints(e)
                this.snap()
                document.removeEventListener(names.mousemove, mousemove)
                document.removeEventListener(names.mouseup, mouseup)
            }
            document.addEventListener(names.mousedown, this.mousedown = mousedown)
        },
        stopPropagation(e) {
            e.stopPropagation()
        },
        preventDefault(e) {
            e.preventDefault()
        },
        handleCancel(e) {
            e.stopPropagation()
            this.$emit('cancel')
        },
        calOutputRect() {
            const imgW = this.pxWidth
            const imgH = this.pxHeight
            const rotate = this.rotate % 4

            if(rotate % 2 === 1) {
                const offsetLeft = (this.left / this.zoom) >> 0
                const offsetTop = (this.top / this.zoom) >> 0
                const height = (this.viewport.width / this.zoom) >> 0
                const width = (this.viewport.height / this.zoom) >> 0

                const left = Math.max(0, (imgW - width) / 2 - offsetLeft) >> 0
                const top = Math.max(0, (imgH - height) / 2 - offsetTop) >> 0
                return {
                    left, top, width, height,
                    rotate: this.rotate % 4,
                    pxWidth: this.pxWidth, pxHeight: this.pxHeight,
                }
            } else {
                const offsetLeft = (this.left / this.zoom) >> 0
                const offsetTop = (this.top / this.zoom) >> 0
                const width = (this.viewport.width / this.zoom) >> 0
                const height = (this.viewport.height / this.zoom) >> 0

                const left = Math.max(0, (imgW - width) / 2 - offsetLeft) >> 0
                const top = Math.max(0, (imgH - height) / 2 - offsetTop) >> 0
                return {
                    left, top, width, height,
                    rotate: this.rotate % 4,
                    pxWidth: this.pxWidth, pxHeight: this.pxHeight,
                }
            }
        },
        async handleConfirm(e) {
            e.stopPropagation()
            const rect = this.calOutputRect()
            const w = this.viewport.width
            const h = this.viewport.height
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            ctx.translate(w / 2, h / 2)
            const sourceRect = [rect.left, rect.top, rect.width, rect.height]
            const distanceRect = rect.rotate % 2 === 1 ? [h / -2, w / -2, h, w] : [w / -2, h / -2, w, h]
            ctx.rotate(-.5 * rect.rotate * Math.PI)
            const image = await loadImage(this.src)
            ctx.drawImage(image
                , sourceRect[0], sourceRect[1], sourceRect[2], sourceRect[3]
                , distanceRect[0], distanceRect[1], distanceRect[2], distanceRect[3]
            )
            try {
                if(this.src instanceof File) {
                    const result = await toBlob(canvas, this.src.type)
                    const file = new File([result], this.src.name)
                    this.$emit('done', file)
                } else {
                    const result = await toBlob(canvas)
                    this.$emit('done', result)
                }
            } catch(ex) {
                this.$emit('error', ex)
            }

        },
        handleRotate() {
            this.rotate = (this.rotate + 1);
        }
    },
    mounted() {
        this.initSrc(this.src)
        this.initEvents()
    },
    beforeDestroy() {
        const names = getEventNames()
        document.removeEventListener(names.mousedown, this.mousedown)
    }
}
</script>
<style lang="scss" scoped>
.avatar-croper-wrapper {
    position: fixed;
    z-index: 99;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #000;
    background-repeat: no-repeat;
    user-select: none;
    .image-wrapper {
        position: absolute;
        background-color: rgba(255,255,255,0.2);
        .image-container {
            position: absolute;
            width: 100%;
            height: 100%;
            transform-origin: center center;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
        }
    }
    .mask {
        background-color: rgba(0, 0, 0, 0.5);
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        display: flex;
        z-index: 5;
        user-select: none;
        // backdrop-filter: blur(2px);
    }
    .debug {
        z-index: 99;
        position: relative;
        display: block;
        pointer-events: none;
        color: #fff;
        user-select: none;
        padding: 10px;
    }
    .btns {
        position: absolute;
        width: 100%;
        bottom: 0;
        color: #fff;
        z-index: 10;
        display: flex;
        font-size: 16px;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        padding-bottom: 40px;
        // background-color: rgba(255,255,255,0.2);
        user-select: none;
        .btn {
            // border: 1px solid #fff;
            user-select: none;
            padding: 5px 10px;
            &.icon {
                padding: 0;
                margin: 0;
                width: 20px;
                height: 20px;
                background-image: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjU2IDI1NiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTE1Ny4xLDIyLjhsLTEyLjgsMTIuOGwxMi42LDEyLjZjNi45LDYuOSwxMi44LDEyLjUsMTMsMTIuNWMwLjcsMCw4LTcuNCw4LThjMC0wLjMtMi4zLTIuNy01LTUuNWMtMi43LTIuOC00LjktNS4xLTQuOC01LjNjMC4xLTAuMSwyLjUsMCw1LjQsMC4zYzIzLjMsMi4xLDM2LjksOS4yLDQzLjksMjIuN2M0LjgsOS4yLDYuNSwxOS42LDYuNSwzOC40djEwLjNoNi4yaDYuM2wtMC4zLTkuN2MtMC40LTE0LjQtMC43LTE4LjktMS45LTI1LjRjLTQuNC0yNi0xOS00MC41LTQ2LjYtNDYuM2MtMi4xLTAuNS03LjUtMS4yLTEyLTEuN2wtOC4xLTAuOUwxNzMsMjRsNS40LTUuNGwtNC4zLTQuM2wtNC4yLTQuMkwxNTcuMSwyMi44eiIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0xOS41LDE2MS45VjI0Nmg4NC4xaDg0LjF2LTg0LjFWNzcuOGgtODQuMUgxOS41VjE2MS45eiBNMTc1LjgsMTYxLjl2NzIuMmgtNzIuMkgzMS41di03Mi4yVjg5LjdoNzIuMmg3Mi4yVjE2MS45eiIvPjwvZz48L3N2Zz4=");
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
            }
        }
    }
}
</style>
