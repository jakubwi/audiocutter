//set album name
const albumString = document.getElementById('album')
const albumButton = document.getElementById('albumBtn')
const currentAlbumName = document.getElementById('currentAlbumName')
albumButton.addEventListener('click', () => {
    const album = albumString.value.trim()
    window.electronAPI.setAlbum(album)
    if (album == '') {
        currentAlbumName.innerText = 'none'
    } else {
        currentAlbumName.innerText = album
    }
    
})

//getting audio file path
const mp3Button = document.getElementById('mp3')
const filepath = document.getElementById('filepath')
mp3Button.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    if (filePath == 'none') {
        filepath.innerText = filePath
    } else {
        const fileName = filePath.split('\\')
        filepath.innerText = fileName.at(-1)
    }
})

//getting save directory
const dirButton = document.getElementById('dirBtn')
const savedir = document.getElementById('savedir')
dirButton.addEventListener('click', async () => {
    const dirPath = await window.electronAPI.openDir()
    savedir.innerText = dirPath
})

//get cutting progress updates from main.js
const cuttingProg = document.getElementById('cuttingProg')
const cuttingProgStrong = document.getElementById('cuttingProgStrong')

window.electronAPI.onUpdateCutting((_event, value) => {
    cuttingProg.innerText = "Done: "
    cuttingProgStrong.innerText = value
})

//get tracklist and generate audio files
//open modal (alert) if album name, save dir or file not set/choosen
const tracklistBtn = document.getElementById('tracklistBtn')
const tracklistString = document.getElementById('tracklist')

const modal = document.getElementById('id01')
const modalBtn = document.getElementById('modalStart')
const modalCloseBtn = document.getElementById('modalX')

tracklistBtn.addEventListener('click', async () => {
    if (filepath.innerText == 'none' || currentAlbumName.innerText == 'none'
        || savedir.innerText == 'none') {
        modal.style.display = 'block'
    } else {
        const tracklist = tracklistString.value
        const response = await window.electronAPI.setTracklist(tracklist)
        const ffmpegMsgSpan = document.getElementById('ffmpegMsg')
        //get messages from ffmpeg
        if (response == 'done') {
        } else {
            ffmpegMsgSpan.innerText = response.at(-1)
        }
    }
})
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none'
})

//DWNLD
//open download window (modal)
const dwnldBtn = document.getElementById('dwnldHere')
const dwnldWindow = document.getElementById('dwnldWindow')
const dwnldWindowCloseBtn = document.getElementById('dwnldWindowX')

dwnldBtn.addEventListener('click', async () => {
    dwnldWindow.style.display = 'block'
})
dwnldWindowCloseBtn.addEventListener('click', () => {
    dwnldWindow.style.display = 'none'
})

//DWNLD
//getting download save directory
const dwnldFolder = document.getElementById('dwnldFolder')
const dwnldSaveFolder = document.getElementById('dwnldSaveFolder')
dwnldFolder.addEventListener('click', async () => {
    const dirPath = await window.electronAPI.openDwnldDir()
    dwnldSaveFolder.innerText = dirPath
})

//DWNLD
const dwnldFinishBtn = document.getElementById('dwnldFinishBtn')
const dwnldLink = document.getElementById('dwnldLink')
const dwnldName = document.getElementById('dwnldName')

const dwnldDoneMsg = document.getElementById('dwnldDoneMsg')

dwnldFinishBtn.addEventListener('click', async () => {
    dwnldDoneMsg.innerText = ''
    if (dwnldLink.value == '' || dwnldName.value == '') {
        dwnldDoneMsg.innerText =
            "Link or name empty. Please enter values."
    } else {
        const dwnldInfo = [dwnldLink.value, dwnldName.value]
        const dwnldResponse = await window.electronAPI.setDwnldInfo(dwnldInfo)

        //get messages from ffmpeg
        if (dwnldResponse == 'success') {
        } else {
            dwnldDoneMsg.innerText = dwnldResponse
        }
    }
})

//DWNLD
//get download progress updates from main.js
const dwnldProg = document.getElementById('download-progress')
const dwnldProgText = document.getElementById('dwnldProg')

window.electronAPI.onUpdateProgressDownload((_event, value) => {
    if (value == 100) {
        dwnldProgText.innerText = "Download done."
        dwnldProg.innerText = ''
    } else {
        dwnldProgText.innerText = "Download progress: "
        dwnldProg.innerText = value + '%'
    }
})
