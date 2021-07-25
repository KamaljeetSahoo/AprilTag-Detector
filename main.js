//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
//'use strict';
const video = window.video = document.getElementById('webcam_feed')
const canvas = window.canvas = document.getElementById('canvas')
//const context = canvas.getContext('2d')
//canvas.width = '80%'
//canvas.height = '80%'

const parameters = {
    audio: false,
    video: true,
    video: {width: 640, height: 480}
}

const handleWebcamFeed = (stream) => {
    window.stream = stream
    video.srcObject = stream
    video.play()
}

const handleError = (error) => {
    console.log(error)
}

navigator.mediaDevices.getUserMedia(constraints = parameters).then(handleWebcamFeed).catch(handleError)
