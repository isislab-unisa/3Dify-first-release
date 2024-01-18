async function onSelectedImageChanged(uri) {
  const img = await faceapi.fetchImage(uri)
  $(`#inputImg`).get(0).src = img.src
  //updateResults()
}

async function loadImageFromUrl(url) {
  const img = await requestExternalImage($('#imgUrlInput').val())
  $('#inputImg').get(0).src = img.src
  updateResults()
}

async function loadImageFromUpload() {
    const imgFile = $('#queryImgUploadInput').get(0).files[0]
    const img = await faceapi.bufferToImage(imgFile)
    $('#inputImg').get(0).src = img.src
    updateResults()
}

async function loadImageFromUploadMediaPipeTest() {
  const imgFile = $('#queryImgUploadInput').get(0).files[0]
  const img = await faceapi.bufferToImage(imgFile)
  $('#inputImg').get(0).src = img.src
  const oldCanvas = document.getElementById("overlay");
  if (oldCanvas) {
    oldCanvas.parentNode.removeChild(oldCanvas);
  }

}


function renderImageSelectList(selectListId, onChange, initialValue) {
  let images = ['therock.png']

  function renderChildren(select) {
    images.forEach(imageName =>
      renderOption(
        select,
        imageName,
        imageName
      )
    )
  }

  renderSelectList(
    selectListId,
    onChange,
    initialValue,
    renderChildren
  )
}

function initImageSelectionControls(initialValue = 'therock.png') {
  renderImageSelectList(
    '#selectList',
    async (uri) => {
      await onSelectedImageChanged(uri)
    },
    initialValue
  )
  onSelectedImageChanged($('#selectList select').val())
}
