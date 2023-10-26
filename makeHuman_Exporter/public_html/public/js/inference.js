const makeHumanParameters = {
    "version": "v1.2.1",
    "modifier head/head-round": "0.118000",
    "modifier head/head-rectangular": "0",
    "modifier eyebrows/eyebrows-trans-down|up": "-0.584000",
    "modifier eyes/r-eye-height2-decr|incr": "-0.542000",
    "modifier eyes/r-eye-trans-in|out": "0.514000",
    "modifier eyes/r-eye-trans-down|up": "0.444000",
    "modifier eyes/l-eye-height2-decr|incr": "-0.542000",
    "modifier eyes/l-eye-trans-in|out": "0.514000",
    "modifier eyes/l-eye-trans-down|up": "0.444000",
    "modifier nose/nose-trans-down|up": "0.208000",
    "modifier nose/nose-scale-vert-decr|incr": "0.292000",
    "modifier nose/nose-scale-horiz-decr|incr": "-0.056000",
    "modifier mouth/mouth-scale-horiz-decr|incr": "0.416000",
    "modifier mouth/mouth-scale-vert-decr|incr": "0.458000",
    "modifier breast/BreastSize": "0.500000",
    "modifier breast/BreastFirmness": "0.500000",
    "modifier macrodetails/Gender": "1.000000",
    "modifier macrodetails/Age": "0.701000",
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
    "material HighPolyEyes": "2c12f43b-1303-432c-b7ce-d78346baf2e6 eyes/materials/brownlight.mhmat",
    "material eyebrow011": "19e43555-4613-4457-ac6e-c30bf350d275 eyebrow011.mhmat"
}

var landmarkPositions = []
var scaledLandmarkPositions = []
var limits = []

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clamp01(value) {
    return clamp(value, 0, 1);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function lerp(a, b, t) {
    return (1-t)*a + t*b
}

function inverseLerp(a, b, x){
    return clamp((x-a) / (b-a), 0, 1)
}

function setHeadRound()
{
    let headRound = inverseLerp(0.2, 0.1, scaledLandmarkPositions[0].x)
    makeHumanParameters["modifier head/head-round"] = headRound.toString()
}

// IMPLEMENT OTHER PARAMETERS

function calculateLimits(positions){
    // TODO set a global variable for the square that includes the points, in pixels
    landmarkPositions = [...positions]
    const centerXpx = landmarkPositions[8]._x
    const centerYpx = (landmarkPositions[0]._y + landmarkPositions[16]._y) * 0.5
    const halfSizepx = Math.abs(landmarkPositions[8].y - centerYpx)
    const sizepx = halfSizepx * 2
    const leftpx = centerXpx - halfSizepx
    const rightpx = centerXpx + halfSizepx
    const downpx = landmarkPositions[8]._y
    const uppx = downpx - sizepx
    limits[0] = {x: leftpx, y: downpx}
    limits[1] = {x: rightpx, y: uppx}

    for(let i = 0; i < landmarkPositions.length; ++i) {
        let newX = inverseLerp(limits[0].x, limits[1].x, landmarkPositions[i].x)
        let newY = inverseLerp(limits[0].y, limits[1].y, landmarkPositions[i].y)
        scaledLandmarkPositions[i] = {x: newX, y: newY}
    }
}

function doInference()
{
    setHeadRound()
    // TODO add other 
}

function testDownload(){
    const keys = Object.keys(makeHumanParameters)
    let outputFile = ""
    for(let i = 0; i < keys.length; ++i){
        outputFile += `${keys[i]} ${makeHumanParameters[keys[i]]}\n`
    }
    download('output.mhm', outputFile)
}