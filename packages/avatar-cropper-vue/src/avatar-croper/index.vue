<template>
    <div ref="wrapper" class="avatar-croper-wrapper" :style="imgCssText">
        <div class="mask" :style="maskCssText">
            <pre v-if="debug" class="debug">{{ debugCode }}</pre>
        </div>
    </div>
</template>
<script lang="js">
import { calClipPath, calContainSize, loadImage, getEventNames, getEventPoints, calDistance } from './utils'
export default {
    props: {
        src: {
            type: String,
            default: ''
        },
        maxZoom: {
            type: Number,
            default: 1.2
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
            }, null, '  ')
        },
        imgCssText() {
            if(!this.url) {
                return ''
            }
            return `background-image:url("${this.url}");`
            + `background-position:${this.left}px ${this.top}px;`
            + `background-size:${this.width}px ${this.height}px;`
        },
        maskCssText() {
            if(!this.viewport) {
                return ''
            }
            const clipPath = calClipPath(window.innerWidth, window.innerHeight, this.viewport)
            return `clip-path:path('${clipPath}');`
        },
        minWidth() {
            return this.minZoom * this.pxWidth
        },
        maxWidth() {
            return this.maxZoom * this.pxWidth
        },
        minHeight() {
            return this.minZoom * this.pxHeight
        },
        maxHeight() {
            return this.maxZoom * this.pxHeight
        },
        minLeft() {
            if(!this.viewport) {
                return 0
            }
            return this.viewport.width - this.width + this.viewport.left
        },
        maxLeft() {
            if(!this.viewport) {
                return window.innerWidth
            }
            return this.viewport.left
        },
        minTop() {
            if(!this.viewport) {
                return 0
            }
            return this.viewport.height - this.height + this.viewport.top
        },
        maxTop() {
            if(!this.viewport) {
                return window.innerWidth
            }
            return this.viewport.top
        },
    },
    data() {
        return {
            viewport: null,
            url: '',
            width: 0,
            height: 0,
            left: 0,
            top: 0,
            points: [],
            snapWidth: 0,
            snapHeight: 0,
            snapLeft: 0,
            snapTop: 0,
            snapPoints: [],
            pxWidth: 0,
            pxHeight: 0,
            minZoom: 1,
        }
    },
    methods: {
        initSrc(src) {
            this.viewport = calContainSize(window.innerWidth, window.innerHeight, 1, 10)
            if(!src) {
                this.url = ''
                this.width = 0
                this.height = 0
                this.left = 0
                this.top = 0
            } else {
                loadImage(src).then(img => {
                    this.url = src
                    this.pxWidth = img.width
                    this.pxHeight = img.height
                    this.minZoom = Math.max(this.viewport.width / img.width, this.viewport.height / img.height)
                    // this.minZoom = 0.8
                    this.width = img.width * this.minZoom
                    this.height = img.height * this.minZoom
                    this.left = (window.innerWidth - this.width) / 2
                    this.top = (window.innerHeight - this.height) / 2
                })
            }
        },
        snap() {
            this.snapWidth = this.width
            this.snapHeight = this.height
            this.snapLeft = this.left
            this.snapTop = this.top
            this.snapPoints = this.points.slice(0)
        },
        resolveMouseMove() {
            if(this.snapPoints.length === 1 && this.points.length > 0) {
                const [o] = this.snapPoints
                const [p] = this.points
                const left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + p.x - o.x))
                const top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + p.y - o.y))
                this.left = left
                this.top = top
            } else if(this.snapPoints.length === 2 && this.points.length > 1) {
                const [a1, a2] = this.snapPoints
                const [b1, b2] = this.points
                const zoom = calDistance(b1, b2) / calDistance(a1, a2)
                this.width = Math.min(this.maxWidth, Math.max(this.minWidth, this.snapWidth * zoom))
                this.height = Math.min(this.maxHeight, Math.max(this.minHeight, this.snapHeight * zoom))
                const left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + (this.snapWidth - this.width) / 2))
                const top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + (this.snapHeight - this.height) / 2))
                this.left = left
                this.top = top
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
                wrapper.addEventListener(names.mousemove, mousemove)
                wrapper.addEventListener(names.mouseup, mouseup)
            }
            const mousemove = e => {
                this.points = getEventPoints(e)
                this.resolveMouseMove()
            }
            const mouseup = e => {
                this.points = getEventPoints(e)
                this.snap()
                wrapper.removeEventListener(names.mousemove, mousemove)
                wrapper.removeEventListener(names.mouseup, mouseup)
            }
            wrapper.addEventListener(names.mousedown, mousedown)
        },
    },
    mounted() {
        this.initSrc(this.src)
        this.initEvents()
    },
    beforeDestroy() {
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
        background-color: rgba(0, 0, 0, 0.7);
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        display: flex;
        z-index: 5;
        user-select: none;
        .debug {
            z-index: 99;
            position: relative;
            display: block;
            pointer-events: none;
            color: #fff;
            user-select: none;
        }
    }
    
}
</style>