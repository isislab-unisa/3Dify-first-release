//import vision from '/@mediapipe/tasks-vision';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const makeHumanParameters = {
    "# Written by MakeHuman": "1.2.0 final",
    "version": "v1.2.0",
    "modifier head/head-round": "0",
    "modifier head/head-rectangular": "0",
    "modifier eyebrows/eyebrows-angle-down|up": "0",
    "modifier eyebrows/eyebrows-trans-down|up": "0",
    "modifier eyes/r-eye-height2-decr|incr": "0",
    "modifier eyes/r-eye-scale-decr|incr": "0",
    "modifier eyes/r-eye-trans-in|out": "0",
    "modifier eyes/r-eye-trans-down|up": "0",
    "modifier eyes/l-eye-height2-decr|incr": "0",
    "modifier eyes/l-eye-scale-decr|incr": "0",
    "modifier eyes/l-eye-trans-in|out": "0",
    "modifier eyes/l-eye-trans-down|up": "0",
    "modifier nose/nose-trans-down|up": "0",
    "modifier nose/nose-scale-vert-decr|incr": "0",
    "modifier nose/nose-scale-horiz-decr|incr": "0",
    "modifier mouth/mouth-scale-horiz-decr|incr": "0",
    "modifier mouth/mouth-scale-vert-decr|incr": "0",
    "modifier breast/BreastSize": "0.500000",
    "modifier breast/BreastFirmness": "0.500000",
    "modifier macrodetails/Gender": "1.000000",
    "modifier macrodetails/Age": "0.500000",
    "modifier macrodetails/African": "0.333333",
    "modifier macrodetails/Asian": "0.333333",
    "modifier macrodetails/Caucasian": "0.333333",
    "modifier macrodetails-universal/Muscle": "0.500000",
    "modifier macrodetails-universal/Weight": "0.500000",
    "modifier macrodetails-height/Height": "0.500000",
    "modifier macrodetails-proportions/BodyProportions": "0.500000",
    "eyebrows eyebrow011": "19e43555-4613-4457-ac6e-c30bf350d275",
    "eyes HighPolyEyes": "2c12f43b-1303-432c-b7ce-d78346baf2e6",
    "clothesHideFaces": "True",
    "skinMaterial": "skins/middleage_caucasian_male/middleage_caucasian_male.mhmat",
    "material HighPolyEyes": "2c12f43b-1303-432c-b7ce-d78346baf2e6 eyes/materials/brown.mhmat",
    "material eyebrow011": "19e43555-4613-4457-ac6e-c30bf350d275 eyebrow011.mhmat"
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clamp01(value) {
    return clamp(value, 0, 1);
}

function lerp(a, b, t) {
    return (1-t)*a + t*b
}

function inverseLerp(a, b, x){
    return clamp((x-a) / (b-a), 0, 1)
}

function map01tominus11(x){
    return x*2-1
}

function sendJsonModifiers() {
    let outputFile = JSON.stringify(makeHumanParameters)

    saveJsonFile(outputFile)
}
window.sendJsonModifiers = sendJsonModifiers;

function saveJsonFile(text) {
    document.getElementById("export_button").style.display = "none";
    document.getElementById("exporting_button").style.display = "block";
    document.getElementById("apply_slider").style.display = "none";
    document.getElementById("applying_slider").style.display = "block";

    fetch('/applymodifiers', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text})
            })
            .then(res => 
                {
                    console.log(res)
                    document.getElementById("exporting_button").style.display = "none";
                    document.getElementById("download_button").style.display = "block";
                    document.getElementById("apply_slider").style.display = "block";
                    document.getElementById("applying_slider").style.display = "none";
                    document.getElementById("slider").style.display = "block";
                }
            )
}

function downloadFbx() {
    document.getElementById("download_button").style.display = "none";
    document.getElementById("exporting_button").style.display = "block";
    const options = {
        method: 'GET',
    };
    fetch('/downloadFbxZip', options)
        .then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", 'avatar.zip');
                a.click();
                document.getElementById("download_button").style.display = "block";
                document.getElementById("exporting_button").style.display = "none";
            }
            )
        });
}
window.downloadFbx = downloadFbx;

function applySlider() {
    const sliderName = document.getElementById('sliderInputModifier').value
    const sliderValue = document.getElementById('sliderInputValue').value
    const sliderJson =
    {
        "modifier": sliderName,
        "value": sliderValue
    }
    document.getElementById("download_button").style.display = "none";
    document.getElementById("exporting_button").style.display = "block";
    document.getElementById("apply_slider").style.display = "none";
    document.getElementById("applying_slider").style.display = "block";

    fetch('/applymodifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliderJson })
    })
        .then(res => {
            console.log(res)
            document.getElementById("download_button").style.display = "block";
            document.getElementById("exporting_button").style.display = "none";
            document.getElementById("apply_slider").style.display = "block";
            document.getElementById("applying_slider").style.display = "none";
        }
        )
}
window.applySlider = applySlider;


const {FaceLandmarker, FilesetResolver, DrawingUtils} = vision;

let faceLandmarker;

//Carica il modello e la libreria di mediaPipe ed imposta i parametri per la rilevazione dei landmark del volto
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

function normalize(value, min, max){
    return (value - min) / (max - min);
}

//Calcola i limiti del quadrato di riferimento per l'estrazione delle feature
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

    await changeFaceDetector(SSD_MOBILENETV1)
    await faceapi.loadFaceLandmarkModel('/')
    await faceapi.nets.ageGenderNet.load('/')


    //FaceAPI for gender and age
    if (!isFaceDetectionModelLoaded()) {
        console.log("Face detection model not loaded")
        return
    }

    const options = getFaceDetectorOptions()

    const faceAPIResults = await faceapi.detectAllFaces(event.target, options).withFaceLandmarks()
        .withAgeAndGender()

    let gender = faceAPIResults[0].gender
    let genderValue = 0.0
    if (gender.toLowerCase() == "male") {
        genderValue = 1.0
    }
    makeHumanParameters["modifier macrodetails/Gender"] = genderValue.toString()

    let age = faceAPIResults[0].age
    let ageValue
    if (age <= 25.0) {
        ageValue = inverseLerp(0, 25, age) * 0.5
    }
    else {
        ageValue = inverseLerp(25, 99, age) * 0.5 + 0.5
    }
    makeHumanParameters["modifier macrodetails/Age"] = ageValue.toString()


    console.log("GENDER : " + gender)
    console.log("AGE : " + age)


    if(!faceLandmarker){
        console.log("faceLandmarker not ready");
        return;
    }

    //Se presente rimuove un canvas con le mesh generate precedentemente
    const oldCanvas = document.getElementById("overlay");
    if(oldCanvas){
        oldCanvas.parentNode.removeChild(oldCanvas);
    }

    //Rileva i landmark del volto e li disegna su un canvas creato appositamente
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
            {color: "blue"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            {color: "blue"}
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
            {color: "blue"}
        );
        drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            {color: "#30FF30"}
        );
    }

    console.log(faceLandmarkerResult.faceLandmarks);
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
    //let startX = limits.minX * canvas.width;
    //let startY = limits.maxY * canvas.height - squareSize;
    let startX = startXUpSX;
    let startY = startYUpSX + squareSize;

    console.log("startXUpSX: " + startXUpSX);
    console.log("startYUpSX: " + startYUpSX);
    console.log("startX: " + startX);
    console.log("startY: " + startY);


    ctx.beginPath();
    ctx.rect(startXUpSX, startYUpSX, squareSize, squareSize);
    ctx.rect(startX, startY, 4, 4)
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


    //Points ID for feature extraction
    // let nosePoints = [2, 9, 129, 358]; //GIU, SU, SX, DX
    // let faceShapePoints = [10, 93, 152, 323, 150, 379]; //SU. SX, GIU, DX, SX_GIU, DX_GIU
    // let rightEyePoints = [133, 145, 159, 130]; //DX, GIU, SU, SX
    // let rightEyeBrowPoints = [46, 55, 52, 65, 70, 107, 105, 66]; //GIU_SX, GIU_DX, GIU_CENT_SX, GIU_CENT_DX, SU_SX, SU_DX, SU_CENT_SX, SU_CENT_DX
    // let leftEyePoints = [263, 362, 374, 386]; //DX, SX, GIU, SU
    // let leftEyeBrowPoints = [276, 285, 300, 336, 282, 295, 334, 296]; //GIU_DX, GIU_SX, SU_DX, SU_SX, GIU_CENT_SX, GIU_CENT_DX, SU_CENT_SX, SU_CENT_DX
    // let lipsPoints = [61, 17, 291, 0] //SX, GIU, DX, SU

    let nosePoints = [2, 9, 129, 358]; //GIU, SU, SX, DX
    let faceShapePoints = [152, 10, 93, 323, 150, 379]; //GIU. SU, SX, DX, SX_GIU, DX_GIU
    let rightEyePoints = [145, 159, 33, 133]; //GIU, SU, SX, DX
    let rightEyeBrowPoints = [46, 55, 52, 65, 70, 107, 105, 66]; //GIU_SX, GIU_DX, GIU_CENT_SX, GIU_CENT_DX, SU_SX, SU_DX, SU_CENT_SX, SU_CENT_DX
    let leftEyePoints = [374, 386, 362, 263]; //DX, SX, GIU, SU
    let leftEyeBrowPoints = [285, 276, 282, 295, 336, 300, 334, 296]; //GIU_SX, GIU_DX, GIU_CENT_SX, GIU_CENT_DX, SU_SX, SU_DX, SU_CENT_SX, SU_CENT_DX
    let lipsPoints = [17, 0, 61, 291] //GIU, SU, SX, DX


    let points = [nosePoints, faceShapePoints, rightEyePoints, rightEyeBrowPoints, leftEyePoints, leftEyeBrowPoints, lipsPoints];

    let noseCoord = [];
    let faceShapeCoord = [];
    let rightEyeCoord = [];
    let rightEyeBrowCoord = [];
    let leftEyeCoord = [];
    let leftEyeBrowCoord = [];
    let lipsCoord = [];

    let coord = {
        noseCoord: noseCoord,
        faceShapeCoord: faceShapeCoord,
        rightEyeCoord: rightEyeCoord,
        rightEyeBrowCoord: rightEyeBrowCoord,
        leftEyeCoord: leftEyeCoord,
        leftEyeBrowCoord: leftEyeBrowCoord,
        lipsCoord: lipsCoord
    }

    //Disegna tutti i punt estratti e li salva in un array
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


    //Convert points to feature for makehuman and save them in a distance dictionary and then normalize them between 0 and 1 for the sliders
    let distanceDictionary = {}
    let normalizedDistanceDictionary = {}
    //LIPS
    //Distanza x tra i punti esterni della bocca DX e SX
    let distanceXLips = Math.abs(lipsCoord[2].x - lipsCoord[3].x);
    distanceDictionary["distanceXLips"] = distanceXLips;
    normalizedDistanceDictionary["mouth/mouth-scale-horiz-decr|incr"] = normalize(distanceXLips,0.242151 ,0.380956);
    //Distanza y tra i punti esterni della bocca UP e DW
    let distanceYLips = Math.abs(lipsCoord[1].y - lipsCoord[0].y);
    distanceDictionary["distanceYLips"] = distanceYLips;
    normalizedDistanceDictionary["mouth/mouth-scale-vert-decr|incr"] = normalize(distanceYLips,0.090961 ,0.185984);


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
    let distanceYEyeBrowSX = Math.abs(leftEyeBrowCoord[4].y - leftEyeBrowCoord[5].y);
    distanceDictionary["distanceYEyeBrowSX"] = distanceYEyeBrowSX;

    //Differenza delle y dei punti centrali rispetto agli esterni
    let meanEyeBrowLeftExtY = (leftEyeBrowCoord[4].y + leftEyeBrowCoord[5].y) * 0.5;
    let meanEyeBrowLeftIntY = (leftEyeBrowCoord[6].y + leftEyeBrowCoord[7].y) * 0.5;
    let distanceEyeBrowLeftY = Math.abs(meanEyeBrowLeftExtY - meanEyeBrowLeftIntY);
    distanceDictionary["distanceEyeBrowLeftY"] = distanceEyeBrowLeftY;

    let meanDistanceYEyeBrow = (distanceYEyeBrowDX + distanceYEyeBrowSX) * 0.5;
    distanceDictionary["meanDistanceYEyeBrow"] = meanDistanceYEyeBrow;
    let meanDistanceEyeBrowY = (distanceEyeBrowRightY + distanceEyeBrowLeftY) * 0.5;
    distanceDictionary["meanDistanceEyeBrowY"] = meanDistanceEyeBrowY;
    normalizedDistanceDictionary["eyebrows/eyebrows-trans-down|up"] = normalize(meanDistanceYEyeBrow, 0.000050, 0.043772);
    normalizedDistanceDictionary["eyebrows/eyebrows-angle-down|up"] = normalize(meanDistanceEyeBrowY, 0.016942, 0.040273);



    //EYES
    //RIGHT EYE
    //Distanza x tra estremi dx e sx
    let distanceXRightEye = Math.abs(rightEyeCoord[2].x - rightEyeCoord[3].x);
    distanceDictionary["distanceXRightEye"] = distanceXRightEye;
    normalizedDistanceDictionary["eyes/r-eye-scale-decr|incr"] = normalize(distanceXRightEye, 0.145855, 0.196153);

    //Distanza y tra estremi up e dw
    let distanceYRightEye = Math.abs(rightEyeCoord[0].y - rightEyeCoord[1].y);
    distanceDictionary["distanceYRightEye"] = distanceYRightEye;
    normalizedDistanceDictionary["eyes/r-eye-height2-decr|incr"] = normalize(distanceYRightEye, 0.031517, 0.074913);

    //Distanza x dal centro degli occhi ad un punto del naso (punto in alto)
    //Punto centrale degli occhi

    let centerPointRightEye = {
        x: (rightEyeCoord[0].x + rightEyeCoord[1].x) * 0.5,
        y: (rightEyeCoord[0].y + rightEyeCoord[1].y) * 0.5
    };


    //Distanza X dal punto centrale degli occhi al punto del naso
    let distanceRightEyeCenterNose = Math.abs(centerPointRightEye.x - noseCoord[1].x);
    distanceDictionary["distanceRightEyeCenterNose"] = distanceRightEyeCenterNose;
    normalizedDistanceDictionary["eyes/r-eye-trans-in|out"] = normalize(distanceRightEyeCenterNose, 0.178379, 0.232985);

    //Distanza Y dal punto centrale degli occhi al mento
    let distanceRightEyeCenterChin = Math.abs(centerPointRightEye.y - faceShapeCoord[0].y);
    distanceDictionary["distanceRightEyeCenterChin"] = distanceRightEyeCenterChin;
    normalizedDistanceDictionary["eyes/r-eye-trans-down|up"] = normalize(distanceRightEyeCenterChin, 0.655851, 0.735935);


    //LEFT EYE
    //Distanza x tra estremi dx e sx
    let distanceXLeftEye = Math.abs(leftEyeCoord[0].x - leftEyeCoord[1].x);
    distanceDictionary["distanceXLeftEye"] = distanceXLeftEye;
    normalizedDistanceDictionary["eyes/l-eye-scale-decr|incr"] = normalize(distanceXLeftEye, 0.000610, 0.020363);

    //Distanza y tra estremi up e dw
    let distanceYLeftEye = Math.abs(leftEyeCoord[2].y - leftEyeCoord[3].y);
    distanceDictionary["distanceYLeftEye"] = distanceYLeftEye;
    normalizedDistanceDictionary["eyes/l-eye-height2-decr|incr"] = normalize(distanceYLeftEye, 0.008417, 0.034097);

    //Distanza x dal centro degli occhi ad un punto del naso (punto in alto)
    //Punto centrale degli occhi
    let centerPointLeftEye = {
        x: (leftEyeCoord[0].x + leftEyeCoord[1].x) * 0.5,
        y: (leftEyeCoord[0].y + leftEyeCoord[1].y) * 0.5
    };

    //Distanza X dal punto centrale degli occhi al punto del naso
    let distanceLeftEyeCenterNose = Math.abs(centerPointLeftEye.x - noseCoord[1].x);
    distanceDictionary["distanceLeftEyeCenterNose"] = distanceLeftEyeCenterNose;
    normalizedDistanceDictionary["eyes/l-eye-trans-in|out"] = normalize(distanceLeftEyeCenterNose, 0.174884, 0.230997);

    //Distance Y dal punto centrale degli occhi al mento
    let distanceLeftEyeCenterChin = Math.abs(centerPointLeftEye.y - faceShapeCoord[0].y);
    distanceDictionary["distanceLeftEyeCenterChin"] = distanceLeftEyeCenterChin;
    normalizedDistanceDictionary["eyes/l-eye-trans-down|up"] = normalize(distanceLeftEyeCenterChin, 0.648646, 0.734962);

    //NOSE
    //Distanza Y dal punto basso del naso al mento
    let distanceLowNoseChin = Math.abs(noseCoord[0].y - faceShapeCoord[0].y);
    distanceDictionary["distanceLowNoseChin"] = distanceLowNoseChin;  
    normalizedDistanceDictionary["nose/nose-trans-down|up"] = normalize(distanceLowNoseChin, 0.367967, 0.458889);

    //Distanza Y dal punto piu alto al puno piu basso del naso
    let distanceLowHighNose = Math.abs(noseCoord[1].y - noseCoord[0].y);
    distanceDictionary["distanceLowHighNose"] = distanceLowHighNose;
    normalizedDistanceDictionary["nose/nose-scale-vert-decr|incr"] = normalize(distanceLowHighNose, 0.336936, 0.415726);

    //Distanza x tra le due narici
    let distanceNostrilNose = Math.abs(noseCoord[2].x - noseCoord[3].x);
    distanceDictionary["distanceNostrilNose"] = distanceNostrilNose;
    normalizedDistanceDictionary["nose/nose-scale-horiz-decr|incr"] = normalize(distanceNostrilNose, 0.210454, 0.286658);

    //FACE SHAPE
    //Head-round
    //Distanza x tra estremo SX e estremo DX
    let distanceUpperFace = Math.abs(faceShapeCoord[2].x - faceShapeCoord[3].x);
    distanceDictionary["distanceUpperFace"] = distanceUpperFace;
    normalizedDistanceDictionary["head/head-round"] = normalize(distanceUpperFace, 0.818938, 1.000000);

    //Head-rectangular
    //Distanza x tra estremo SX e mento SX
    let distanceLeftLowerFace = Math.abs(faceShapeCoord[2].x - faceShapeCoord[4].x);

    // distanceDictionary["distanceLeftLowerFace"] = distanceLeftLowerFace;
    //Distanza x tra estremo DX e mento DX
    let distanceRightLowerFace = Math.abs(faceShapeCoord[3].x - faceShapeCoord[5].x);

    // distanceDictionary["distanceRightLowerFace"] = distanceRightLowerFace;
    //media delle due distance
    let meanDistanceLowerFace = (distanceLeftLowerFace + distanceRightLowerFace) * 0.5;
    distanceDictionary["meanDistanceLowerFace"] = meanDistanceLowerFace;
    normalizedDistanceDictionary["head/head-rectangular"] = normalize(meanDistanceLowerFace, 0.152612, 0.232226);

    for(let key in normalizedDistanceDictionary){
        makeHumanParameters["modifier " + key] = normalizedDistanceDictionary[key].toString();
    }
    
    console.log("Distance Dictionary");
    console.log(distanceDictionary);

    console.log("Normalized Distance Dictionary");
    console.log(normalizedDistanceDictionary);

    console.log("MakeHuman Parameters");
    console.log(makeHumanParameters);

    //HandleClick on created Canvas for getting normalized coordinates of point clicked
    canvas.addEventListener("click", handleClickCanvas);

    function handleClickCanvas(event){
        console.log("click on canvas");
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        //normalize x and y inside the square

        let xNorm = (x - startX) / squareSize;
        let yNorm = (y - startY) / squareSize;

        console.log("xNorm: " + xNorm);
        console.log("yNorm: " + yNorm);

        let pointSize = 2;

        let xD = xNorm * squareSize + startX;
        let yD = yNorm * squareSize + startY;


        ctx.fillStyle = "#fc03a9";
        ctx.fillRect(xD, yD, pointSize, pointSize);
    }


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

