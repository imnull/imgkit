import { useState } from 'react';
import './app.scss'
import ImageUpload from '~/components/image-upload'
import ImageViewer from '~/components/image-viewer'
import Button from '~/components/button'
import ExifList from '~/components/exif-list'
import { readAsDataURL, webRebuildImage, ExifOperator } from '@imnull/imgkit/src/index';

export default () => {
    const [src, setSrc] = useState('')
    const [exif, setExif] = useState<any>(null)
    return <div className="app-root">
        {!src ? <>
            <ImageUpload
                onSelected={async file => {
                    
                    const op = new ExifOperator(await file.arrayBuffer())
                    const exif = op.getExif()
                    setExif(exif)

                    const cleanFile = await webRebuildImage(file)
                    const dataUrl = await readAsDataURL(cleanFile)
                    setSrc(dataUrl)
                }}
            />
        </> :  <>
            <ImageViewer src={src} />
            <Button
                type="primary"
                text="清除"
                onTap={() => {
                    setSrc('')
                    setExif(null)
                }}
            />
            <ExifList exif={exif} />
        </>}
    </div>
}

