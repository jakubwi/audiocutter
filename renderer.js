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

//get tracklist and generate audio files
//open modal (alert) if album name, save dit or file not set/choosen
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
            ffmpegMsgSpan.innerText = "Files generated successfully!"
        } else {
            ffmpegMsgSpan.innerText = response.at(-1)
        }

        
    }
})
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none'
})


