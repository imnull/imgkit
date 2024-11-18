import { TExif } from "@imnull/imgkit"
import './index.scss'

export default (props: {
    exif: TExif;
}) => {
    const { exif } = props
    return <div className="exif-list-wrapper">
        <h3>Exif</h3>
        <ul>{
            Object.entries(exif).map(([key, val], idx) => <li key={idx}>
                <label>{key}</label>
                <span>{val}</span>
            </li>)
        }</ul>
    </div>
}