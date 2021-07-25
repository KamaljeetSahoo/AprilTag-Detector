import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

import * as Base64 from "./base64.js";

var detections = [];


async function init() {
  const Apriltag = Comlink.wrap(new Worker("apriltag.js"));

  window.apriltag = await new Apriltag(Comlink.proxy(() => {
    window.requestAnimationFrame(process_frame);
  }));
}

window.onload = (event) => {
  init();
}


async function process_frame() {

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  let ctx = canvas.getContext("2d");
  let imageData;
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  } catch (err) {
    console.log("Video Problem");
    setTimeout(process_frame, 500);
    return;
  }
  let imageDataPixels = imageData.data;
  let grayscalePixels = new Uint8Array(ctx.canvas.width * ctx.canvas.height); // this is the grayscale image we will pass to the detector

  for (var i = 0, j = 0; i < imageDataPixels.length; i += 4, j++) {
    let grayscale = Math.round((imageDataPixels[i] + imageDataPixels[i + 1] + imageDataPixels[i + 2]) / 3);
    grayscalePixels[j] = grayscale;
    imageDataPixels[i] = grayscale;
    imageDataPixels[i + 1] = grayscale;
    imageDataPixels[i + 2] = grayscale;
  }
  ctx.putImageData(imageData, 0, 0);

  let detected_ids = []
  detections.forEach(det => {

    detected_ids.push(det.id)
    // draw tag borders
    ctx.beginPath();
    ctx.lineWidth = "5";
    ctx.strokeStyle = "darksalmon";
    ctx.moveTo(det.corners[0].x, det.corners[0].y);
    ctx.lineTo(det.corners[1].x, det.corners[1].y);
    ctx.lineTo(det.corners[2].x, det.corners[2].y);
    ctx.lineTo(det.corners[3].x, det.corners[3].y);
    ctx.lineTo(det.corners[0].x, det.corners[0].y);
    ctx.font = "bold 20px Arial";
    var txt = "" + det.id;
    ctx.fillStyle = "blue";
    ctx.textAlign = "center";
    ctx.fillText(txt, det.center.x, det.center.y + 5);
    ctx.stroke();
  });

  if (detections.length == 0) {
    $("#detections").html("<span id='no_detections'>None</span>")
    document.getElementById('detected_ids').innerHTML = ''
  }
  if (detections.length > 0) {
    $("#detections").html("<span>" + detections.length + " AprilTags Found</span>")
    document.getElementById('detected_ids').innerHTML = 'Tag IDs: ' + detected_ids
  }

  detections = await apriltag.detect(grayscalePixels, ctx.canvas.width, ctx.canvas.height);

  window.requestAnimationFrame(process_frame);
}