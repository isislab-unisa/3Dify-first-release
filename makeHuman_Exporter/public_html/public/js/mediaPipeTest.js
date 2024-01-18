//import vision from '/@mediapipe/tasks-vision';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const {FaceLandmarker, FilesetResolver, DrawingUtils} = vision;

let faceLandmarker;

async function createFaceLandmarker(){
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions:{
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "IMAGE",
        numFaces: 1,
    });
}
createFaceLandmarker();

const inputImage = document.getElementById("inputImg");

inputImage.addEventListener("click", handleCLick); 

function calculateLimits(landmarks) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let landmarkCategory of landmarks) {
        for (let landmark of landmarkCategory) {
            if (landmark.x < minX) minX = landmark.x;
            if (landmark.y < minY) minY = landmark.y;
            if (landmark.x > maxX) maxX = landmark.x;
            if (landmark.y > maxY) maxY = landmark.y;
        }
    }

    return { minX, minY, maxX, maxY };
}


async function handleCLick(event){
    console.log("click");
    if(!faceLandmarker){
        console.log("faceLandmarker not ready");
        return;
    }

    const oldCanvas = document.getElementById("overlay");
    if(oldCanvas){
        oldCanvas.parentNode.removeChild(oldCanvas);
    }

    const faceLandmarkerResult = faceLandmarker.detect(event.target);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("id", "overlay");
    canvas.setAttribute("width", event.target.width + "px");
    canvas.setAttribute("height", event.target.height + "px");
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "${event.target.width}px";
    canvas.style.height = "${event.target.height}px";

    event.target.parentNode.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx);
    for (const landmarks of faceLandmarkerResult.faceLandmarks){
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            {color: "#C0C0C070", lineWidth: 1}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            {color: "#FF3030"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            {color: "#FF3030"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            {color: "#30FF30"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            {color: "#30FF30"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            {color: "#E0E0E0"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            {color: "#E0E0E0"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            {color: "#FF3030"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            {color: "#30FF30"}
        );
    }

    let limits = calculateLimits(faceLandmarkerResult.faceLandmarks);
    console.log("limits");
    console.log(limits);
    
    //Disegna un quadrato di riferimento intorno alla mesh creata
    let width = (limits.maxX - limits.minX) * canvas.width;
    let height = (limits.maxY - limits.minY) * canvas.height;

    let squareSize = Math.max(width, height);

    //Angolo in alto a sinistra del quadrato di riferimento
    let startXUpSX = limits.minX * canvas.width + (width - squareSize) / 2;
    let startYUpSX = limits.minY * canvas.height + (height - squareSize) / 2;

    //Angolo in basso a sinistra del quadrato di riferimento
    let startX = limits.minX * canvas.width;
    let startY = limits.maxY * canvas.height - squareSize;

    ctx.beginPath();
    ctx.rect(startXUpSX, startYUpSX, squareSize, squareSize);
    ctx.strokeStyle = "red";
    ctx.stroke();

    //Normalizza i valori dei landmark all'interno del quadrato di riferimento
    let normalizedLandmarks = [];
    for (const landmarks of faceLandmarkerResult.faceLandmarks){
        normalizedLandmarks.push([]);
        for (const landmark of landmarks){
            normalizedLandmarks[normalizedLandmarks.length - 1].push({
                x: (landmark.x - startX / canvas.width) / (squareSize / canvas.width),
                y: (landmark.y - startY / canvas.height) / (squareSize / canvas.height),
                z: landmark.z - (startX / canvas.width)
            });
        }
    }

    //Print to console all the normalized landmarks
    console.log("All normalized landmarks")
    console.log(normalizedLandmarks);

    //Normalized Landmark test
    let lm = normalizedLandmarks[0][270];
    let x = lm.x * squareSize + startX;
    let y = lm.y * squareSize + startY;

    let pointSize = 5;

    ctx.fillStyle = "yellow";
    ctx.fillRect(x, y, pointSize, pointSize);


    //Create a list of all the FaceLandmarker type
    let faceLandmarkerTypes = [
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION
    ];

    // for (let type of faceLandmarkerTypes){
    //     for (let cord of type){
    //         ctx.fillStyle = "yellow";

    //         let lm1 = normalizedLandmarks[0][cord.start];
    //         let x1 = lm1.x * squareSize + startX;
    //         let y1 = lm1.y * squareSize + startY;
    //         ctx.fillRect(x1, y1, 2, 2);

    //         let lm2 = normalizedLandmarks[0][cord.end];
    //         let x2 = lm2.x * squareSize + startX;
    //         let y2 = lm2.y * squareSize + startY;
    //         ctx.fillRect(x2, y2, 2, 2);
    //     }
    // }
    

    //Print to console all the landmarks
    // console.log("All landmarks")
    // console.log(faceLandmarkerResult.faceLandmarks);
    // console.log("RIGHT_EYE landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE);
    // console.log("RIGHT_EYEBROW landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW);
    // console.log("RIGHT_IRIS landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS);
    // console.log("LEFT_EYE landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE);
    // console.log("LEFT_EYEBROW landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW);
    // console.log("LEFT_IRIS landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS);
    // console.log("FACE_LIPS landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_LIPS);
    // console.log("FACE_OVAL landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_FACE_OVAL);
    // console.log("FACE_TESSELATION landmarks");
    // console.log(FaceLandmarker.FACE_LANDMARKS_TESSELATION);


}

