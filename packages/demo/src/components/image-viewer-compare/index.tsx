import './index.scss'
export default (props: { origin: string; fixed: string; }) => {
    return <div className="image-viewer-compare-wrapper">
        <div className="image-viewer origin" style={{ backgroundImage: `url("${props.origin}")` }}></div>
        <div className="image-viewer fixed" style={{ backgroundImage: `url("${props.fixed}")` }}></div>
    </div>
}