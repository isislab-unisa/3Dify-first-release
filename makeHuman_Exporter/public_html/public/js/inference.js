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

var landmarkPositions = []
var scaledLandmarkPositions = []
var limits = []
var detectedGender
var detectedAge

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

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function setHeadRound(){    
    const headRoundLeft = inverseLerp(0.2, 0.1, scaledLandmarkPositions[0].x)
    const headRoundRight = inverseLerp(0.8, 0.9, scaledLandmarkPositions[16].x)
    const headRound = (headRoundLeft + headRoundRight) * 0.5
    makeHumanParameters["modifier head/head-round"] = headRound.toString()
}

function setHeadRectangular(){
    const headMinX = scaledLandmarkPositions[0].x
    const headMaxX = scaledLandmarkPositions[16].x
    const cheekBoneNormalizedX = inverseLerp(headMinX, headMaxX, scaledLandmarkPositions[5].x)
    const headRect = inverseLerp(0.12, 0.08, cheekBoneNormalizedX)
    makeHumanParameters["modifier head/head-rectangular"] = headRect.toString()
}

function setEyebrowsAngle(){
    const eyebrowleftYDiff = Math.abs(scaledLandmarkPositions[17].y - scaledLandmarkPositions[21].y)
    const eyebrowrightYDiff = Math.abs(scaledLandmarkPositions[22].y - scaledLandmarkPositions[26].y)
    const meanDiff = (eyebrowleftYDiff + eyebrowrightYDiff) * 0.5
    const meanDiffNorm = map01tominus11(inverseLerp(0.08, -0.08, meanDiff))
    makeHumanParameters["modifier eyebrows/eyebrows-angle-down|up"] = meanDiffNorm.toString()
}

function setEyebrowsMoveVert(){
    const meanEyebrowLeftExternalY = (scaledLandmarkPositions[17].y + scaledLandmarkPositions[21].y) * 0.5
    const eyebrowLeftCentralY = scaledLandmarkPositions[19].y
    const eyebrowLeftYDiff = Math.abs(meanEyebrowLeftExternalY - eyebrowLeftCentralY)

    const meanEyebrowRightExternalY = (scaledLandmarkPositions[22].y + scaledLandmarkPositions[26].y) * 0.5
    const eyebrowRightCentralY = scaledLandmarkPositions[24].y
    const eyebrowRightYDiff = Math.abs(meanEyebrowRightExternalY - eyebrowRightCentralY)

    const meanEyebrowYDiff = (eyebrowLeftYDiff + eyebrowRightYDiff) * 0.5
    const meanEyebrowYDiffNorm = map01tominus11(inverseLerp(0, 0.07, meanEyebrowYDiff))
    makeHumanParameters["modifier eyebrows/eyebrows-trans-down|up"] = meanEyebrowYDiffNorm.toString()
}

function setMouthScaleVert(){
    const lowerPartUpperLip = scaledLandmarkPositions.slice(61, 64)
    const upperPartLowerLip = scaledLandmarkPositions.slice(65, 68)
    const centralPartMouth = lowerPartUpperLip.concat(upperPartLowerLip)
    const centralMouthSumY = centralPartMouth.reduce((sum, current) => sum + current.y, 0)
    const centralMouthMeanY = centralMouthSumY / centralPartMouth.length

    const mouthPoints = scaledLandmarkPositions.slice(48, 68)    
    const maxLipY = mouthPoints.reduce((max, current) => Math.max(max, current.y), -Infinity)
    const minLipY = mouthPoints.reduce((min, current) => Math.min(min, current.y), Infinity)

    const diffUpperLipCentralMouthY = Math.abs(maxLipY - centralMouthMeanY)
    const diffLowerLipCentralMouthY = Math.abs(minLipY - centralMouthMeanY)
    const meanDiff = (diffUpperLipCentralMouthY + diffLowerLipCentralMouthY) * 0.5

    const mouthScaleVert = map01tominus11(inverseLerp(0.02, 0.07, meanDiff))
    makeHumanParameters["modifier mouth/mouth-scale-vert-decr|incr"] = mouthScaleVert.toString()
}

function setMouthScaleHoriz(){
    const mouthPoints = scaledLandmarkPositions.slice(48, 68)
    const maxLipX = mouthPoints.reduce((max, current) => Math.max(max, current.x), -Infinity)
    const minLipX = mouthPoints.reduce((min, current) => Math.min(min, current.x), Infinity)
    const lipDiffX = Math.abs(maxLipX - minLipX)

    const mouthScaleHoriz = map01tominus11(inverseLerp(0.18, 0.3, lipDiffX))
    makeHumanParameters["modifier mouth/mouth-scale-horiz-decr|incr"] = mouthScaleHoriz.toString()
}

function setEyeScaleAndHeight2(){
    const maxLeftEyeX = scaledLandmarkPositions[39].x
    const minLeftEyeX = scaledLandmarkPositions[36].x
    const widthLeftEye = Math.abs(maxLeftEyeX - minLeftEyeX)

    const maxRightEyeX = scaledLandmarkPositions[45].x
    const minRightEyeX = scaledLandmarkPositions[42].x
    const widthRightEye = Math.abs(maxRightEyeX - minRightEyeX)

    const meanEyeWidth = (widthLeftEye + widthRightEye) * 0.5
    const eyeScale01 = inverseLerp(0.08, 0.13, meanEyeWidth)
    const eyeScale = map01tominus11(eyeScale01)
    makeHumanParameters["modifier eyes/l-eye-scale-decr|incr"] = eyeScale.toString()
    makeHumanParameters["modifier eyes/r-eye-scale-decr|incr"] = eyeScale.toString()

    const leftEyeCentralUpperPoints = scaledLandmarkPositions.slice(37, 39)
    const leftEyeCentralUpperSumY = leftEyeCentralUpperPoints.reduce((sum, current) => sum + current.y, 0)
    const leftEyeCentralUpperMeanY = leftEyeCentralUpperSumY * 0.5
    const leftEyeCentralLowerPoints = scaledLandmarkPositions.slice(40, 42)
    const leftEyeCentralLowerSumY = leftEyeCentralLowerPoints.reduce((sum, current) => sum + current.y, 0)
    const leftEyeCentralLowerMeanY = leftEyeCentralLowerSumY * 0.5
    const leftEyeHeight = Math.abs(leftEyeCentralUpperMeanY - leftEyeCentralLowerMeanY)

    const rightEyeCentralUpperPoints = scaledLandmarkPositions.slice(43, 45)
    const rightEyeCentralUpperSumY = rightEyeCentralUpperPoints.reduce((sum, current) => sum + current.y, 0)
    const rightEyeCentralUpperMeanY = rightEyeCentralUpperSumY * 0.5
    const rightEyeCentralLowerPoints = scaledLandmarkPositions.slice(46, 48)
    const rightEyeCentralLowerSumY = rightEyeCentralLowerPoints.reduce((sum, current) => sum + current.y, 0)
    const rightEyeCentralLowerMeanY = rightEyeCentralLowerSumY * 0.5
    const rightEyeHeight = Math.abs(rightEyeCentralUpperMeanY - rightEyeCentralLowerMeanY)

    const eyeHeight = (leftEyeHeight + rightEyeHeight) * 0.5
    const eyeHeightScaled = eyeHeight / (1 + eyeScale * 0.5)
    makeHumanParameters["modifier eyes/l-eye-height2-decr|incr"] = eyeHeightScaled.toString()
    makeHumanParameters["modifier eyes/r-eye-height2-decr|incr"] = eyeHeightScaled.toString()
}
    
function setEyeMoveHoriz(){
    const noseX = scaledLandmarkPositions[27].x

    const leftEyePoints = scaledLandmarkPositions.slice(36, 42)
    const leftEyeSumX = leftEyePoints.reduce((sum, current) => sum + current.x, 0)
    const leftEyeMeanX = leftEyeSumX / leftEyePoints.length
    const leftEyeDistToNoseX = Math.abs(leftEyeMeanX - noseX)

    const rightEyePoints = scaledLandmarkPositions.slice(42, 48)
    const rightEyeSumX = rightEyePoints.reduce((sum, current) => sum + current.x, 0)
    const rightEyeMeanX = rightEyeSumX / rightEyePoints.length
    const rightleftEyeDistToNoseX = Math.abs(rightEyeMeanX - noseX)

    const meanEyeDistToNoseX = (leftEyeDistToNoseX + rightleftEyeDistToNoseX) * 0.5

    const eyeMoveHoriz = map01tominus11(inverseLerp(0.11, 0.15, meanEyeDistToNoseX))
    makeHumanParameters["modifier eyes/l-eye-trans-in|out"] = eyeMoveHoriz.toString()
    makeHumanParameters["modifier eyes/r-eye-trans-in|out"] = eyeMoveHoriz.toString()
}

function setEyeMoveVert(){
    const leftEyePoints = scaledLandmarkPositions.slice(36, 42)
    const leftEyeSumY = leftEyePoints.reduce((sum, current) => sum + current.y, 0)
    const leftEyeMeanY = leftEyeSumY / leftEyePoints.length

    const rightEyePoints = scaledLandmarkPositions.slice(42, 48)
    const rightEyeSumY = rightEyePoints.reduce((sum, current) => sum + current.y, 0)
    const rightEyeMeanY = rightEyeSumY / rightEyePoints.length

    const meanEyeDistToChinY = (leftEyeMeanY + rightEyeMeanY) * 0.5
    const eyeMoveVert = map01tominus11(inverseLerp(0.45, 0.55, meanEyeDistToChinY))
    makeHumanParameters["modifier eyes/l-eye-trans-down|up"] = eyeMoveVert.toString()
    makeHumanParameters["modifier eyes/r-eye-trans-down|up"] = eyeMoveVert.toString()
}

function setNoseMoveVert(){
    const lowestNoseY = scaledLandmarkPositions[33].y
    const noseMoveVert = map01tominus11(inverseLerp(0.28, 0.33, lowestNoseY))
    makeHumanParameters["modifier nose/nose-trans-down|up"] = noseMoveVert.toString()
}

function setNoseScaleVert(){
    const highestNoseY = scaledLandmarkPositions[27].y
    const lowestNoseY = scaledLandmarkPositions[33].y
    const noseDiffY = Math.abs(highestNoseY - lowestNoseY)
    const noseScaleVert = map01tominus11(inverseLerp(0.15, 0.24, noseDiffY))
    makeHumanParameters["modifier nose/nose-scale-vert-decr|incr"] = noseScaleVert.toString()
}

function setNoseScaleHoriz(){
    const leftNostrilX = scaledLandmarkPositions[31].x
    const rightNostrilX = scaledLandmarkPositions[35].x
    const nostrilsDistX = Math.abs(leftNostrilX - rightNostrilX)
    const noseScaleHoriz = map01tominus11(inverseLerp(0.07, 0.14, nostrilsDistX))
    makeHumanParameters["modifier nose/nose-scale-horiz-decr|incr"] = noseScaleHoriz.toString()
}

function setGender()
{
    let genderValue = 0.0
    if(detectedGender.toLowerCase() == "male")
    {
        genderValue = 1.0
    }
    makeHumanParameters["modifier macrodetails/Gender"] = genderValue.toString()
}

function setAge(){
    let ageValue
    if(detectedAge <= 25.0)
    {
        ageValue = inverseLerp(0, 25, detectedAge) * 0.5
    }
    else
    {
        ageValue = inverseLerp(25, 99, detectedAge) * 0.5 + 0.5
    }
    makeHumanParameters["modifier macrodetails/Age"] = ageValue.toString()
}

function calculateLimits(positions, gender, age){
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

    detectedGender = gender
    detectedAge = age
}

function doInference()
{
    setHeadRound()
    setHeadRectangular()
    setEyebrowsAngle()
    setEyebrowsMoveVert()
    setMouthScaleVert()
    setMouthScaleHoriz()
    setEyeScaleAndHeight2()
    setEyeMoveHoriz()
    setEyeMoveVert()
    setNoseMoveVert()
    setNoseScaleVert()
    setNoseScaleHoriz()
    setGender()
    setAge()
}

function downloadMakeHumanFile(){
    const keys = Object.keys(makeHumanParameters)
    let outputFile = ""
    for(let i = 0; i < keys.length; ++i){
        outputFile += `${keys[i]} ${makeHumanParameters[keys[i]]}\n`
    }
    download('output.mhm', outputFile)
}
