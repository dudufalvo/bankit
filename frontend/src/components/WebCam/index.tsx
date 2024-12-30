import { useRef, useEffect } from 'react'
import Webcam from 'react-webcam'

import styles from './webcam.module.scss'

import Button from 'components/Button'

type WebcamCaptureProps = {
	close: () => void
	onCapture: (file: File) => void
}

const WebCamModal = ({ close, onCapture }: WebcamCaptureProps) => {
	const webcamRef = useRef<Webcam>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	const capture = async () => {
		if (webcamRef.current) {
			const imageSrc = webcamRef.current.getScreenshot()
			if (imageSrc) {
				const base64Response = await fetch(imageSrc)
				const blob = await base64Response.blob()

				const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
				onCapture(file)
			}
		}
		close()
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
				close()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [close])

	return (
		<div className={styles.webCamContainer}>
			<div className={styles.webCamPopup} ref={popupRef}>
				<Webcam
					audio={false}
					ref={webcamRef}
					screenshotFormat="image/jpeg"
				/>
				<Button fullWidth handle={capture}>Capture</Button>
			</div>
		</div>
	)
}

export default WebCamModal
