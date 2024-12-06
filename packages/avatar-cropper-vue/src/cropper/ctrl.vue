<template>
    <div class="btns-wrapper" >
        <div
            class="btn"
            @touchstart.stop="stopPropagation"
            @click.stop="handleCommand('cancel')"
        >
            取消
        </div>
        <div
            class="btn icon"
            @touchstart.stop="stopPropagation"
            @click.stop="handleCommand('rotate')"
        ></div>
        <div
            class="btn"
            @touchstart.stop="stopPropagation"
            @click.stop="handleCommand('confirm')"
        >
            确定
        </div>
    </div>
</template>
<script lang="js">
export default {
    methods: {
        stopPropagation(e) {
            e.stopPropagation()
        },
        handleCommand(cmd) {
            this.$emit(cmd)
        }
    }
}
</script>
<style lang="scss" scoped>
.btns-wrapper {
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
        user-select: none;
        height: 36px;
        min-width: 80px;
        box-sizing: border-box;
        border-radius: 18px;
        background-color: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        &.icon {
            padding: 0;
            margin: 0;
            min-width: 48px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-image: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjU2IDI1NiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTE1Ny4xLDIyLjhsLTEyLjgsMTIuOGwxMi42LDEyLjZjNi45LDYuOSwxMi44LDEyLjUsMTMsMTIuNWMwLjcsMCw4LTcuNCw4LThjMC0wLjMtMi4zLTIuNy01LTUuNWMtMi43LTIuOC00LjktNS4xLTQuOC01LjNjMC4xLTAuMSwyLjUsMCw1LjQsMC4zYzIzLjMsMi4xLDM2LjksOS4yLDQzLjksMjIuN2M0LjgsOS4yLDYuNSwxOS42LDYuNSwzOC40djEwLjNoNi4yaDYuM2wtMC4zLTkuN2MtMC40LTE0LjQtMC43LTE4LjktMS45LTI1LjRjLTQuNC0yNi0xOS00MC41LTQ2LjYtNDYuM2MtMi4xLTAuNS03LjUtMS4yLTEyLTEuN2wtOC4xLTAuOUwxNzMsMjRsNS40LTUuNGwtNC4zLTQuM2wtNC4yLTQuMkwxNTcuMSwyMi44eiIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0xOS41LDE2MS45VjI0Nmg4NC4xaDg0LjF2LTg0LjFWNzcuOGgtODQuMUgxOS41VjE2MS45eiBNMTc1LjgsMTYxLjl2NzIuMmgtNzIuMkgzMS41di03Mi4yVjg5LjdoNzIuMmg3Mi4yVjE2MS45eiIvPjwvZz48L3N2Zz4=");
            background-repeat: no-repeat;
            background-position: 16px 12px;
            background-size: 20px 20px;
        }
    }
}
</style>
