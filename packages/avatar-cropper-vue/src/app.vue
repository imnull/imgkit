<template>
    <div class="app">
        <Viewer @select="handleSelectFile" :src="preview" />
        <div class="version">Version 1.2</div>
        <Cropper v-if="showCropper" :debug="true" :padding="20" :src="image" @done="handleCrop" @cancel="handleCancel" />
    </div>
</template>
<script lang="js">
import Cropper from './cropper'
import Viewer from './viewer'
export default {
    components: {
        Cropper,
        Viewer,
    },
    data() {
        return {
            showCropper: false,
            image: null,
            preview: null,
        }
    },
    methods: {
        handleSelectFile(file) {
            this.image = file
            this.showCropper = true
        },
        async handleCrop(file) {
            this.preview = file
            this.handleCancel()
        },
        handleCancel() {
            this.showCropper = false
            this.image = null
        }
    }
}
</script>
<style lang="scss" scoped>
html, body {
    touch-action: manipulation;
}
.version {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 0;
    font-family: monospace, 'Courier New', Courier;
    text-align: center;
    font-size: 12px;
    color: #ccc;
    &::before {
        content: '<';
    }
    &::after {
        content: '>';
    }
}
</style>