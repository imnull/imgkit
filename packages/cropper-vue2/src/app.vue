<template>
    <div class="app">
        <Viewer @select="handleSelectFile" :src="preview" />
        <div class="version">Version 2.1</div>
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
<style lang="scss">
body {
    touch-action: manipulation;
    margin: 0;
    padding: 0;
}
.app {
    overflow: hidden;
    width: 100vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 2vw;
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