import './index.scss'
export default (props: { src: string }) => {
    return <div className="image-viewer-wrapper" style={{ backgroundImage: `url("${props.src}")` }}></div>
}