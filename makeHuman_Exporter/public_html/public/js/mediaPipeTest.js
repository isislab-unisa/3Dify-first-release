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
    // for (const landmarks of faceLandmarkerResult.faceLandmarks){
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_TESSELATION,
    //         {color: "#C0C0C070", lineWidth: 1}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
    //         {color: "#FF3030"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
    //         {color: "#FF3030"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
    //         {color: "#30FF30"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
    //         {color: "#30FF30"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
    //         {color: "#E0E0E0"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_LIPS,
    //         {color: "#E0E0E0"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
    //         {color: "#FF3030"}
    //     );
    //     drawingUtils.drawConnectors(
    //         landmarks,
    //         FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
    //         {color: "#30FF30"}
    //     );
    // }

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

    //Normalized Landmark Drawing (SINGLE POINT)
    // let lm = normalizedLandmarks[0][150];
    // let x = lm.x * squareSize + startX;
    // let y = lm.y * squareSize + startY;
    // // let x = 0.5995368557206636 * squareSize + startX;
    // // let y = 0.2689463031715021 * squareSize + startY;



    // let pointSize = 2;

    // ctx.fillStyle = "yellow";
    // ctx.fillRect(x, y, pointSize, pointSize);


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


    //Points for feature extraction
    let nosePoints = [2, 9, 129, 358]; //GIU, SU, SX, DX
    let faceShapePoints = [10, 93, 152, 323, 150, 379]; //SU. SX, GIU, DX, SX_GIU, DX_GIU
    let rightEyePoints = [133, 145, 159, 130]; //DX, GIU, SU, SX
    let rightEyeBrowPoints = [46, 55, 52, 65, 70, 107, 105, 66]; //GIU_SX, GIU_DX, GIU_CENT_SX, GIU_CENT_DX, SU_SX, SU_DX, SU_CENT_SX, SU_CENT_DX
    let leftEyePoints = [263, 362, 374, 386]; //DX, SX, GIU, SU
    let leftEyeBrowPoints = [276, 285, 300, 336, 282, 295, 334, 296]; //GIU_DX, GIU_SX, SU_DX, SU_SX, GIU_CENT_SX, GIU_CENT_DX, SU_CENT_SX, SU_CENT_DX
    let lipsPoints = [61, 17, 291, 0] //SX, GIU, DX, SU

    let points = [nosePoints, faceShapePoints, rightEyePoints, rightEyeBrowPoints, leftEyePoints, leftEyeBrowPoints, lipsPoints];

    let noseCoord = [];
    let faceShapeCoord = [];
    let rightEyeCoord = [];
    let rightEyeBrowCoord = [];
    let leftEyeCoord = [];
    let leftEyeBrowCoord = [];
    let lipsCoord = [];

    let coord = [noseCoord, faceShapeCoord, rightEyeCoord, rightEyeBrowCoord, leftEyeCoord, leftEyeBrowCoord, lipsCoord];

    for (let p of points){

        for (let i = 0; i < p.length; i++){
            let lm1 = normalizedLandmarks[0][p[i]];
            switch (p) {
                case nosePoints:
                    ctx.fillStyle = "blue";
                    noseCoord.push(lm1);
                    break;
                case faceShapePoints:
                    ctx.fillStyle = "green";
                    faceShapeCoord.push(lm1);
                    break;
                case rightEyePoints:
                    ctx.fillStyle = "red";
                    rightEyeCoord.push(lm1);
                    break;
                case rightEyeBrowPoints:
                    ctx.fillStyle = "yellow";
                    rightEyeBrowCoord.push(lm1);
                    break;
                case leftEyePoints:
                    ctx.fillStyle = "red";
                    leftEyeCoord.push(lm1);
                    break;
                case leftEyeBrowPoints:
                    ctx.fillStyle = "yellow";
                    leftEyeBrowCoord.push(lm1);
                    break;
                case lipsPoints:
                    ctx.fillStyle = "white";
                    lipsCoord.push(lm1);
                    break;
            }

            let x1 = lm1.x * squareSize + startX;
            let y1 = lm1.y * squareSize + startY;

            ctx.fillRect(x1, y1, 2, 2);

        }
    }

    console.log("Coordinates")
    console.log(coord);


    //Convert points to feature for makehuman
    let distanceDictionary = {}
    //LIPS
    //Distanza x tra i punti esterni della bocca DX e SX
    let distanceXLips = Math.abs(lipsCoord[0].x - lipsCoord[2].x);
    distanceDictionary["distanceXLips"] = distanceXLips;
    //Distanza y tra i punti esterni della bocca UP e DW
    let distanceYLips = Math.abs(lipsCoord[3].y - lipsCoord[1].y);
    distanceDictionary["distanceYLips"] = distanceYLips;


    //EYEBROW DX
    //Differenza delle y dei punti esterni
    let distanceYEyeBrowDX = Math.abs(rightEyeBrowCoord[4].y - rightEyeBrowCoord[5].y);
    distanceDictionary["distanceYEyeBrowDX"] = distanceYEyeBrowDX;

    //Differenza delle y dei punti centrali rispetto agli esterni
    let meanEyeBrowRightExtY = (rightEyeBrowCoord[4].y + rightEyeBrowCoord[5].y) * 0.5;
    let meanEyeBrowRightIntY = (rightEyeBrowCoord[6].y + rightEyeBrowCoord[7].y) * 0.5;
    let distanceEyeBrowRightY = Math.abs(meanEyeBrowRightExtY - meanEyeBrowRightIntY);
    distanceDictionary["distanceEyeBrowRightY"] = distanceEyeBrowRightY;


    //EYEBROW SX
    //Differenza delle y dei punti esterni
    let distanceYEyeBrowSX = Math.abs(leftEyeBrowCoord[2].y - leftEyeBrowCoord[3].y);
    distanceDictionary["distanceYEyeBrowSX"] = distanceYEyeBrowSX;

    //Differenza delle y dei punti centrali rispetto agli esterni
    let meanEyeBrowLeftExtY = (leftEyeBrowCoord[2].y + leftEyeBrowCoord[3].y) * 0.5;
    let meanEyeBrowLeftIntY = (leftEyeBrowCoord[6].y + leftEyeBrowCoord[7].y) * 0.5;
    let distanceEyeBrowLeftY = Math.abs(meanEyeBrowLeftExtY - meanEyeBrowLeftIntY);
    distanceDictionary["distanceEyeBrowLeftY"] = distanceEyeBrowLeftY;

    //EYES
    //RIGHT EYE
    //Distanza x tra estremi dx e sx
    let distanceXRightEye = Math.abs(rightEyeCoord[3].x - rightEyeCoord[0].x);
    distanceDictionary["distanceXRightEye"] = distanceXRightEye;

    //Distanza y tra estremi up e dw
    let distanceYRightEye = Math.abs(rightEyeCoord[2].y - rightEyeCoord[1].y);
    distanceDictionary["distanceYRightEye"] = distanceYRightEye;

    //Distanza x dal centro degli occhi ad un punto del naso (punto in alto)
    //Punto centrale degli occhi

    let centerPointRightEye = {
        x: (rightEyeCoord[1].x + rightEyeCoord[2].x) * 0.5,
        y: (rightEyeCoord[1].y + rightEyeCoord[2].y) * 0.5
    };


    //Distanza X dal punto centrale degli occhi al punto del naso
    let distanceRightEyeCenterNose = Math.abs(centerPointRightEye.x - noseCoord[1].x);
    distanceDictionary["distanceRightEyeCenterNose"] = distanceRightEyeCenterNose;

    //Distanza Y dal punto centrale degli occhi al mento
    let distanceRightEyeCenterChin = Math.abs(centerPointRightEye.y - faceShapeCoord[2].y);
    distanceDictionary["distanceRightEyeCenterChin"] = distanceRightEyeCenterChin;


    //LEFT EYE
    //Distanza x tra estremi dx e sx
    let distanceXLeftEye = Math.abs(leftEyeCoord[0].x - leftEyeCoord[1].x);
    distanceDictionary["distanceXLeftEye"] = distanceXLeftEye;

    //Distanza y tra estremi up e dw
    let distanceYLeftEye = Math.abs(leftEyeCoord[2].y - leftEyeCoord[3].y);
    distanceDictionary["distanceYLeftEye"] = distanceYLeftEye;

    //Distanza x dal centro degli occhi ad un punto del naso (punto in alto)
    //Punto centrale degli occhi
    let centerPointLeftEye = {
        x: (leftEyeCoord[3].x + leftEyeCoord[2].x) * 0.5,
        y: (leftEyeCoord[3].y + leftEyeCoord[2].y) * 0.5
    };

    //Distanza X dal punto centrale degli occhi al punto del naso
    let distanceLeftEyeCenterNose = Math.abs(centerPointLeftEye.x - noseCoord[1].x);
    distanceDictionary["distanceLeftEyeCenterNose"] = distanceLeftEyeCenterNose;

    //Distance Y dal punto centrale degli occhi al mento
    let distanceLeftEyeCenterChin = Math.abs(centerPointLeftEye.y - faceShapeCoord[2].y);
    distanceDictionary["distanceLeftEyeCenterChin"] = distanceLeftEyeCenterChin;

    //NOSE
    //Distanza Y dal punto basso del naso al mento
    let distanceLowNoseChin = Math.abs(noseCoord[0].y - faceShapeCoord[2].y);
    distanceDictionary["distanceLowNoseChin"] = distanceLowNoseChin;    

    //Distanza Y dal punto piu alto al puno piu basso del naso
    let distanceLowHighNose = Math.abs(noseCoord[1].y - noseCoord[0].y);
    distanceDictionary["distanceLowHighNose"] = distanceLowHighNose;

    //Distanza x tra le due narici
    let distanceNostrilNose = Math.abs(noseCoord[2].x - noseCoord[3].x);
    distanceDictionary["distanceNostrilNose"] = distanceNostrilNose;

    //FACE SHAPE
    //Head-round

    //Head-rectangular
    //Distanza x tra estremo SX e mento SX
    let distanceLeftLowerFace = Math.abs(faceShapeCoord[1].x - faceShapeCoord[4].x);
    distanceDictionary["distanceLeftLowerFace"] = distanceLeftLowerFace;
    //Distanza x tra estremo DX e mento DX
    let distanceRightLowerFace = Math.abs(faceShapeCoord[3].x - faceShapeCoord[5].x);
    distanceDictionary["distanceRightLowerFace"] = distanceRightLowerFace;

    console.log("Distance Dictionary");
    console.log(distanceDictionary);


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

