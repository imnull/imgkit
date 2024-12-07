<template>
    <div
        ref="wrapper"
        @contextmenu.prevent="preventDefault"
        class="avatar-croper-wrapper"
    >
        <div class="image-wrapper" :style="cropper ? cropper.WrapperCssText : ''">
            <div class="container" :style="cropper ? cropper.ZoomCssText : ''">
                <div class="container rotate" :style="cropper ? cropper.RotateCssText : ''">
                    <canvas
                        ref="canvas"
                        @contextmenu.prevent="preventDefault"
                        class="image-entity"
                        :style="cropper ? cropper.ImageCssText : ''"
                    />
                </div>
            </div>
        </div>
        <div class="mask" :style="cropper ? cropper.MaskCssText : ''"></div>
        <pre v-if="debug && cropper" class="debug">{{ cropper.debugCode }}</pre>
        <Ctrl @rotate="handleRotate" @cancel="handleCancel" @confirm="handleConfirm" />
    </div>
</template>
<script lang="js">
import {
    loadImage,
    getEventNames,
} from './utils'
import Ctrl from './ctrl.vue'
import { ImageCropper } from '@imnull/image-cropper'
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
    data() {
        return {
            cropper: null,
        }
    },
    methods: {
        async initSrc(src) {
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
                    this.drawCanvas(img)
                    this.cropper = new ImageCropper({
                        imageWidth: img.width,
                        imageHeight: img.height
                    })
                    this.initEvents()
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
        initEvents() {
            const wrapper = this.$refs.wrapper
            if(!wrapper) {
                return
            }
            const names = getEventNames()
            const mousedown = e => {
                this.cropper.snapEvent(e)
                document.addEventListener(names.mousemove, mousemove, { passive: false })
                document.addEventListener(names.mouseup, mouseup)
            }
            const mousemove = e => {
                e.preventDefault()
                this.cropper.resolveEventPoints(e)
            }
            const mouseup = e => {
                this.cropper.snapEvent(e)
                document.removeEventListener(names.mousemove, mousemove)
                document.removeEventListener(names.mouseup, mouseup)
            }
            const gesturestart = e => {
                e.preventDefault()
            }
            document.addEventListener('gesturestart', this.gesturestart = gesturestart)
            wrapper.addEventListener(names.mousedown, this.mousedown = mousedown, { passive: false })
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
                const res = await this.cropper.crop(this.src)
                this.$emit('done', res)
            } catch(ex) {
                this.$emit('error', ex)

            }
        },
        handleRotate() {
            this.cropper.calRotate(1)
        }
    },
    mounted() {
        this.initSrc(this.src)
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
