<template>
    <div class="app">
        <h1>Hello VUE 2</h1>
        <AvatarCropper :debug="true" src="images/1.jpg" />
    </div>
</template>
<script lang="js">
import AvatarCropper from './avatar-croper'
export default {
    components: {
        AvatarCropper,
    }
}
</script>
<style lang="scss"></style>