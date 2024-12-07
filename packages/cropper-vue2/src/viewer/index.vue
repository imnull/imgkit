<template>
    <div class="image-viewer" @click="handleClick" :style="wrapperCssText">
        <input accept="image/*" :key="hash" class="file" ref="file" type="file" @change="handleFileChange" />
    </div>
</template>
<script lang="js">
import { readAsDataURL } from '../cropper/utils'
export default {
    props: {
        src: {
            type: [String, File],
            default: '',
        }
    },
    watch: {
        src: {
            handler(val) {
                if(!val) {
                    return
                }
                if(val instanceof File) {
                    readAsDataURL(val).then(dataUrl => {
                        this.preview = dataUrl
                    })
                } else {
                    this.preview = `${val}`
                }
            }
        }
    },
    computed: {
        wrapperCssText() {
            if(!this.preview) {
                return ''
            }
            return `background-image:url("${this.preview}");background-size:contain;`
        }
    },
    methods: {
        handleClick() {
            this.$refs.file.click()
        },
        handleFileChange(e) {
            const files = e.target.files
            if(files && files.length > 0) {
                const file = files[0]
                this.$emit('select', file)
                this.hash = Date.now()
            }
        }
    },
    data() {
        return {
            hash: Date.now(),
            preview: '',
        }
    }
}
</script>
<style lang="scss" scoped>
.image-viewer {
    // border: 2px dotted #ccc;
    border-radius: 12px;
    background-color: #fafafa;
    box-sizing: border-box;
    height: 96vw;
    width: 96vw;
    margin: 0 auto;
    background-image: url("images/upload-cccccc.svg");
    background-size: 30%;
    background-repeat: no-repeat;
    background-position: center;
    .file {
        display: none;
    }
}
</style>