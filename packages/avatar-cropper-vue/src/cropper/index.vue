<template>
    <div
        ref="wrapper"
        @contextmenu.prevent="preventDefault"
        class="avatar-croper-wrapper"
    >
        <div class="image-wrapper" :style="wrapperCssText">
            <div class="container" :style="zoomCssText">
                <div class="container rotate" :style="rotateCssText">
                    <canvas
                        ref="canvas"
                        @contextmenu.prevent="preventDefault"
                        class="image-entity"
                        :style="imgCssText"
                    />
                </div>
            </div>
        </div>
        <div class="mask" :style="maskCssText"></div>
        <pre v-if="debug" class="debug">{{ debugCode }}</pre>
        <Ctrl @rotate="handleRotate" @cancel="handleCancel" @confirm="handleConfirm" />
    </div>
</template>
<script lang="js">
import {
    calClipPath,
    calContainSize,
    calCoverSize,
    loadImage,
    getEventNames,
    getEventPoints,
    calDistance,
    renderCropImage,
} from './utils'
import Ctrl from './ctrl.vue'
export default {
    components: {
        Ctrl,
    },
    props: {
        src: {
            type: File,
            default: null
        },
        padding: {
            type: Number,
            default: 10,
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
            if(!this.viewport || !this.container) {
                return ''
            }
            const rect = this.container
            return `width:${rect.width}px;height:${rect.height}px;left:${rect.left + this.viewport.left}px;top:${rect.top + this.viewport.top}px;`;
        },
        rotateCssText() {
            return `transform:rotate(${this.rotate * -90}deg);`
        },
        zoomCssText() {
            return `transform:scale(${this.zoom});`
        },
        imgCssText() {
            const x = this.left
            const y = this.top
            return `transform:translateX(${x}px) translateY(${y}px);`
        },
        minLeft() {
            if(!this.viewport || !this.container) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.width
            if(rotate % 2 === 1) {
                dim = this.viewport.height
            }
            return (dim - this.container.width * this.zoom) / 2 / this.zoom
        },
        maxLeft() {
            if(!this.viewport || !this.container) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.width
            if(rotate % 2 === 1) {
                dim = this.viewport.height
            }
            return (this.container.width * this.zoom - dim) / 2 / this.zoom
        },
        minTop() {
            if(!this.viewport || !this.container) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.height
            if(rotate % 2 === 1) {
                dim = this.viewport.width
            }
            return (dim - this.container.height * this.zoom) / 2 / this.zoom
        },
        maxTop() {
            if(!this.viewport || !this.container) {
                return 0
            }
            const rotate = this.rotate % 4
            let dim = this.viewport.height
            if(rotate % 2 === 1) {
                dim = this.viewport.width
            }
            return (this.container.height * this.zoom - dim) / 2 / this.zoom
        },
    },
    data() {
        return {
            viewport: null,
            container: null,
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
            maxZoom: 20,
            minZoom: 1,
            rotate: 0,
            ratio: 1,
        }
    },
    methods: {
        async initSrc(src) {
            this.viewport = null
            this.container = null

            this.clearCanvas()

            this.left = 0
            this.top = 0
            this.zoom = 1
            this.rotate = 0

            if(!src) {
                this.left = 0
                this.top = 0
            } else {
                loadImage(src).then(img => {
                    this.viewport = calContainSize(window.innerWidth, window.innerHeight, this.ratio, this.padding)
                    const clipPath = calClipPath(window.innerWidth, window.innerHeight, this.viewport)
                    this.maskCssText = `clip-path:path('${clipPath}');`
                    this.drawCanvas(img)
                    this.pxWidth = img.width
                    this.pxHeight = img.height
                    this.container = calCoverSize(this.viewport.width, this.viewport.height, this.pxWidth / this.pxHeight)
                    // this.zoom = 1.2
                    // this.rotate = 1
                })
            }
        },
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
        snap() {
            this.snapLeft = this.left
            this.snapTop = this.top
            this.snapZoom = this.zoom
            this.snapPoints = this.points.slice(0)
        },
        calLeft(offset) {
            const rotate = this.rotate % 4
            const sign = rotate === 1 || rotate === 2 ? -1 : 1
            this.left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + offset * sign / this.zoom))
        },

        calTop(offset) {
            const rotate = this.rotate % 4
            const sign = rotate === 2 || rotate === 3 ? -1 : 1
            this.top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + offset * sign / this.zoom))
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
            this.calLeft(0)
            this.calTop(0)
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
                document.addEventListener(names.mousemove, mousemove, { passive: false })
                document.addEventListener(names.mouseup, mouseup)
            }
            const mousemove = e => {
                e.preventDefault()
                this.points = getEventPoints(e)
                this.resolveMouseMove()
            }
            const mouseup = e => {
                this.points = getEventPoints(e)
                this.snap()
                document.removeEventListener(names.mousemove, mousemove)
                document.removeEventListener(names.mouseup, mouseup)
            }
            const gesturestart = e => {
                e.preventDefault()
            }
            document.addEventListener('gesturestart', this.gesturestart = gesturestart)
            document.addEventListener(names.mousedown, this.mousedown = mousedown, { passive: false })
        },
        disposeEvents() {
            const names = getEventNames()
            document.removeEventListener(names.mousedown, this.mousedown)
            document.removeEventListener('gesturestart', this.gesturestart)
        },
        preventDefault(e) {
            e.preventDefault()
        },
        handleCancel(e) {
            this.$emit('cancel')
        },
        
        async handleConfirm() {
            try {
                const res = await renderCropImage(this.src, {
                    viewport: {
                        width: this.viewport.width,
                        height: this.viewport.height,
                    },
                    cover: {
                        width: this.container.width,
                        height: this.container.height,
                    },
                    offset: {
                        left: this.left,
                        top: this.top,
                    },
                    rotate: this.rotate,
                    zoom: this.zoom,
                    imageSize: {
                        width: this.pxWidth,
                        height: this.pxHeight,
                    }
                })
                this.$emit('done', res)
            } catch(ex) {
                this.$emit('error', ex)

            }
        },
        handleRotate() {
            this.rotate = (this.rotate + 1);
            this.calLeft(0)
            this.calTop(0)
        }
    },
    mounted() {
        this.initSrc(this.src)
        this.initEvents()
    },
    beforeDestroy() {
        this.disposeEvents()
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

    .image-wrapper {
        box-sizing: border-box;
        position: absolute;
        .container {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            &.rotate {
                transition: transform 0.2s;
            }
        }
        .image-entity {
            width: 100%;
            height: 100%;
            display: block;
            position: relative;
            box-sizing: border-box;
        }
    }
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
</style>
