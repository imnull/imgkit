<template>
    <div ref="wrapper" @contextmenu.prevent="preventDefault" class="avatar-croper-wrapper">
        <img @contextmenu.prevent="preventDefault" class="handler" :src="url" :style="imgCssText" />
        <div class="mask" :style="maskCssText"></div>
        <pre v-if="debug" class="debug">{{ debugCode }}</pre>
        <div class="btns">
            <div class="btn" @touchstart.stop="stopPropagation" @click.stop="handleCancel">取消</div>
            <div class="btn" @touchstart.stop="stopPropagation" @click.stop="handleConfirm">确定</div>
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
            }, null, '  ')
        },
        imgCssText() {
            if(!this.url) {
                return ''
            }
            return `transform:translateX(${this.left}px) translateY(${this.top}px) scale(${this.width/this.pxWidth});`
            // + `width:${this.width}px;`
            // + `height:${this.height}px;`

            // return `left:${this.left}px;`
            // + `top:${this.top}px;`
            // + `width:${this.width}px;`
            // + `height:${this.height}px;`
        },
        // backImgCssText() {
        //     if(!this.url) {
        //         return ''
        //     }
        //     return `background-image:url("${this.url}");`
        //     + `background-position:${this.left}px ${this.top}px;`
        //     + `background-size:${this.width}px ${this.height}px;`
        // },
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
            maskCssText: '',
        }
    },
    methods: {
        async initSrc(src) {
            this.viewport = calContainSize(window.innerWidth, window.innerHeight, this.ratio, this.padding)
            const clipPath = calClipPath(window.innerWidth, window.innerHeight, this.viewport)
            this.maskCssText = `clip-path:path('${clipPath}');`

            if(!src) {
                this.url = ''
                this.width = 0
                this.height = 0
                this.left = 0
                this.top = 0
            } else {
                loadImage(src).then(img => {
                    this.url = img.src
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
                const hCenter = this.viewport.width / 2 + this.viewport.left
                const vCenter = this.viewport.height / 2 + this.viewport.top
                const hRatio = (hCenter - this.snapLeft) / this.snapWidth
                const vRatio = (vCenter - this.snapTop) / this.snapHeight
                const left = Math.min(this.maxLeft, Math.max(this.minLeft, this.snapLeft + (this.snapWidth - this.width) * hRatio))
                const top = Math.min(this.maxTop, Math.max(this.minTop, this.snapTop + (this.snapHeight - this.height) * vRatio))
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
        async handleConfirm(e) {
            e.stopPropagation()
            const scale = this.pxWidth / this.width

            const left = (this.viewport.left - this.left) * scale
            const top = (this.viewport.top - this.top) * scale
            const width = this.viewport.width * scale
            const height = this.viewport.height * scale
            // const w = 256
            // const h = w * (this.viewport.height / this.viewport.width) >> 0
            const w = this.viewport.width
            const h = this.viewport.height
            const image = await loadImage(this.src)
            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image
                , left, top, width, height
                , 0, 0, w, h
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
    .handler {
        position: absolute;
        z-index: 1;
        transform-origin: left top;
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
        padding-bottom: 40px;
        // background-color: rgba(255,255,255,0.2);
        user-select: none;
        .btn {
            // border: 1px solid #fff;
            user-select: none;
            padding: 5px 10px;
        }
    }
}
</style>