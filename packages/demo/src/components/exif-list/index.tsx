import { TExif } from "@imnull/exif"
import './index.scss'

export default (props: {
    exif: TExif;
}) => {
    const { exif } = props
    return <div className="exif-list-wrapper">
        <h3>Exif</h3>
        {exif ? <ul>{
            Object.entries(exif).sort((a, b) => a[0].localeCompare(b[0])).map(([key, val], idx) => <li key={idx}>
                <label>{key}</label>
                <span>{`${val}`}</span>
            </li>)
        }</ul> : <h4>none</h4>}
    </div>
}