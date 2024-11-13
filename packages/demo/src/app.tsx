import { useState } from 'react'
import './app.scss'
import { webRequestImageBlob, webCompressImageLimit, webCreateImageByUrl, webCropImage, readAsDataURL } from '@imnull/imgkit'

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

export default () => {
    const [dataUrl, setDataUrl] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [oriInfo, setOriInfo] = useState('')
    const [tarInfo, setTarInfo] = useState('')
    return <div className="app-root">
        <img className="preview" src="images/1.jpg" />
        <div className='info'>{oriInfo}</div>
        <hr />
        <button disabled={disabled} onClick={async () => {
            setDataUrl('')
            setOriInfo('')
            setTarInfo('')
            setDisabled(true)
            try {
                const img = await webCreateImageByUrl('images/1.jpg')
                const imgBlob = await webRequestImageBlob('images/1.jpg')
                setOriInfo(`${parseSize(imgBlob.size)} ${img.width}px * ${img.height}px`)

                const newImg = await webCompressImageLimit(imgBlob, 300 * 1000)
                const dataUrl = await readAsDataURL(newImg.blob)
                setTarInfo(`${parseSize(newImg.blob.size)} ${newImg.width}px * ${newImg.height}px`)
                setDataUrl(dataUrl)
            } catch (ex) { }
            setDisabled(false)
        }}>缩小尺寸压缩图片到300KB</button>
        <button disabled={disabled} onClick={async () => {
            setDataUrl('')
            setOriInfo('')
            setTarInfo('')
            setDisabled(true)
            try {
                const img = await webCreateImageByUrl('images/1.jpg')
                const imgBlob = await webRequestImageBlob('images/1.jpg')

                setOriInfo(`${parseSize(imgBlob.size)} ${img.width}px * ${img.height}px`)

                const newImg = await webCropImage(imgBlob, 200, 200)
                const dataUrl = await readAsDataURL(newImg.blob)
                setTarInfo(`${parseSize(newImg.blob.size)} ${newImg.width}px * ${newImg.height}px`)
                setDataUrl(dataUrl)
            } catch (ex) { }
            setDisabled(false)
        }}>裁切图片到指定尺寸200*200</button>
        <hr />
        <div className='info'>{tarInfo}</div>
        <img src={dataUrl} />
    </div>
}

