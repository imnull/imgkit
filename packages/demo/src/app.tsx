import { useState } from 'react'
import './app.scss'
import {
    webRequestImageBlob, webCompressImageLimit, webCreateImageByUrl, webCropImage, readAsDataURL,
    ExifOperator, webRebuildImage,
} from '@imnull/imgkit'

const UNITS = ['KB', 'MB', 'GB']
const parseSize = (size: number, unit: number = 1000) => {
    const us = [...UNITS]
    let s = size, u = 'B'
    while (s > unit && us.length > 0) {
        u = us.shift()!
        s /= unit
    }
    if (unit === 1024) {
        u = u.toLowerCase()
    }
    return Math.round(s * 100) / 100 + u
}

const ExifList = (props: { list: { key: string; value: any; }[] }) => {
    const { list } = props
    return <div className='exif-list-wrapper'>
        <div className='title'>Exif Info</div>
        <ul>{
            list.map((it, i) => <li key={i}><label>{it.key}</label><span>{it.value}</span></li>)
        }</ul>
    </div>
}

export default () => {
    const [dataUrl, setDataUrl] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [oriInfo, setOriInfo] = useState('')
    const [tarInfo, setTarInfo] = useState('')
    const [file, setFile] = useState<Blob | null>(null)
    const [exifList, setExifList] = useState<{ key: string; value: any; }[]>([])
    return <div className="app-root">
        {/* <div className='info'>{oriInfo}</div> */}
        <div className='title-bar'>
            <input type="file" onChange={async e => {
                setExifList([])
                const files = [...(e.target.files || [])]
                const file = files[0]
                const arrayBuffer = await file.arrayBuffer()
                const op = new ExifOperator(arrayBuffer)
                const exif = op.getExif()
                if (exif) {
                    const list = Object.entries(exif).map(([key, value]) => ({ key, value }))
                    setExifList(list)
                }

                const clean = await webRebuildImage(file)
                setFile(clean)
                const dataUrl = await readAsDataURL(clean)
                setDataUrl(dataUrl)
            }} />
            <button disabled={disabled || !file} onClick={async () => {
                if (!file) {
                    return
                }
                setDataUrl('')
                setOriInfo('')
                setTarInfo('')
                setDisabled(true)
                try {
                    const url = await readAsDataURL(file)
                    setDataUrl(url)
                } catch (ex) { }
                setDisabled(false)
            }}>显示原片</button>
            <button disabled={disabled || !file} onClick={async () => {
                if (!file) {
                    return
                }
                setDataUrl('')
                setOriInfo('')
                setTarInfo('')
                setDisabled(true)
                try {
                    const url = await readAsDataURL(file)
                    const img = await webCreateImageByUrl(url)
                    const imgBlob = file
                    setOriInfo(`${parseSize(imgBlob.size)} ${img.width}px * ${img.height}px`)

                    const newImg = await webCompressImageLimit(imgBlob, 300 * 1000)
                    const dataUrl = await readAsDataURL(newImg.blob)
                    setTarInfo(`${parseSize(newImg.blob.size)} ${newImg.width}px * ${newImg.height}px`)
                    setDataUrl(dataUrl)
                } catch (ex) { }
                setDisabled(false)
            }}>缩小尺寸压缩图片到300KB</button>
            <button disabled={disabled || !file} onClick={async () => {
                if (!file) {
                    return
                }
                setDataUrl('')
                setOriInfo('')
                setTarInfo('')
                setDisabled(true)
                try {
                    const url = await readAsDataURL(file)
                    const img = await webCreateImageByUrl(url)
                    const imgBlob = file

                    setOriInfo(`${parseSize(imgBlob.size)} ${img.width}px * ${img.height}px`)

                    const newImg = await webCropImage(imgBlob, 200, 200)
                    const dataUrl = await readAsDataURL(newImg.blob)
                    setTarInfo(`${parseSize(newImg.blob.size)} ${newImg.width}px * ${newImg.height}px`)
                    setDataUrl(dataUrl)
                } catch (ex) { }
                setDisabled(false)
            }}>裁切图片到指定尺寸200*200</button>
        </div>

        <div className='content'>
            <ExifList list={exifList} />
            <div className='images'>
                {tarInfo ? <div className='info'>{tarInfo}</div> : null}
                <img className='rebuild' src={dataUrl} />
            </div>
        </div>
    </div>
}

