// FFMPEG //
// require the ffmpeg package so we can use ffmpeg using JS
const ffmpeg = require('fluent-ffmpeg')
// Get the paths to the packaged versions of the binaries we want to use
const ffmpegPath = require('ffmpeg-static').replace(
    'app.asar', 'app.asar.unpacked')
const ffprobePath = require('ffprobe-static').path.replace(
    'app.asar', 'app.asar.unpacked')
// tell the ffmpeg package where it can find the needed binaries.
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
// FFMPEG END //
// ytdl-core //
const ytdl = require('ytdl-core');
// ytdl-core END //
const { app, BrowserWindow, Menu,
    ipcMain, dialog, globalShortcut } = require('electron')
const path = require('path')


var mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
        backgroundColor: '#F8F4E6',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#F8F4E6',
            symbolColor: '#0E2832',
            //height: 50,
        },
        width: 800,
        height: 800,
        minWidth: 400,
        minHeight: 200,
        icon: __dirname + '/icon.ico',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
    globalShortcut.register('f5', function () {
        mainWindow.reload()
    })
}
const mainMenuTemplate = [
    {
        label: 'Reload',
        click(item, focusedWindow) {
            focusedWindow.reload()
        }
    }]

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push(
        {
            label: 'Developer Tools',
            submenu: [{
                label: 'Toggle DevTools',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }]
        })
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('dialog:openDirectory', handleDirOpen)
    ipcMain.handle('dialog:openDwnldDirectory', handleDwnldDirOpen)
    ipcMain.on('set-album', handleSetAlbum)
    ipcMain.handle('set-tracklist', handleSetTracklist)
    ipcMain.handle('set-downloadInfo', handleDownload)
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
});


// set global variable album name
var albumName = ''
function handleSetAlbum(event, album) {
    albumName = album;
}

// select file to handle; store file path; store file duration
var filePathFinal = ''
var fileDuration = ''
async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        {
            filters: [{ name: 'Audio (tested)', extensions: ['mp3',] },
            { name: 'All files', extensions: ['*'], },]
        })
    if (canceled) {
        return 'none'
    } else {
        filePathFinal = filePaths[0]
        ffmpeg.ffprobe(filePathFinal, (error, metadata) => {
            fileDuration = metadata.format.duration;
        })
        return filePaths[0]
    }
}
// select directory to save new files
var saveDirectory = ''
async function handleDirOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        { properties: ['openDirectory'] })
    if (canceled) {
        return 'none'
    } else {
        saveDirectory = filePaths[0]
        return filePaths[0]
    }
}

// DWNLD
// select directory to save new downloaded files
var saveDwnldDirectory = ''
async function handleDwnldDirOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog(
        { properties: ['openDirectory'] })
    if (canceled) {
        saveDwnldDirectory = ''
        return 'none'
    } else {
        saveDwnldDirectory = filePaths[0]
        return filePaths[0]
    }
}
// DWNLD
// global time to use with ffmpeg progress
var totalTime

// DWNLD
// get link, file name, saveDir and download
function handleDownload(event, dwnldInfo) {
    //unpack dwnldInfo
    const link = dwnldInfo[0]
    const fileName = dwnldInfo[1]
    //check link
    try {
        let url1 = new URL(link);
    } catch (e) {
        return 'That is not correct link!'
    }
    //get from global variable
    const fs = require('fs');
    if (!fs.existsSync(saveDwnldDirectory)) {
        return 'Save directory do not exist!'
    };

    //download audiofile
    const stream = ytdl(link, { quality: 'highestaudio', });
    ffmpeg(stream)
        .audioBitrate(320)
        .on('codecData', data => {
            totalTime = parseInt(data.duration.replace(/:/g, ''))
        })
        .on('progress', progress => {
            const time = parseInt(progress.timemark.replace(/:/g, ''))
            const percent = (time / totalTime) * 100
            console.log(Math.round(percent))
            mainWindow.webContents.send('progress-download', Math.round(percent))
        })
        .on('end', () => {
            console.log('FFmpeg has finished dwnld.');
        })
        .on('error', (error) => {
            console.error(error);
        })
        .save(saveDwnldDirectory + '//' + fileName + `.mp3`)
    return 'success'
}

// get duration of new sound files from timestamps
// eg. difference between file 1 start time and file 2 start time
function durationFromTimestamps(startTime, endTime) {
    const splittedTimeStamps = [startTime.split(':'), endTime.split(':')]
    const timestampsInSeconds = []

    splittedTimeStamps.forEach(element => {
        if (element.length == 3) {
            timestampsInSeconds.push(element[0] * 3600 + element[1] * 60 + +element[2])
        } else if (element.length == 2) {
            timestampsInSeconds.push(element[0] * 60 + +element[1])
        } else {
            timestampsInSeconds.push(element[0])
        }
    })
    const duration = timestampsInSeconds[1] - timestampsInSeconds[0]
    return duration
}
// get endTime of last track
function getLastEndTime() {
    const date = new Date(0);
    // fileDuration from global variable
    date.setSeconds(fileDuration);
    return date.toISOString().substring(11, 19).trim();
}
// create folder from global variables
function createFolder() {
    const fs = require('fs');
    const dir = saveDirectory + '//' + albumName;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return dir
}
// class for storing track object to put to complete tracklist
class Track {
    constructor(name, number, startTime, endTime, duration) {
        this.name = name;
        this.number = number; //as string
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
    }
}
// convert string timestamps from user to tracklist of Track objects
function handleSetTracklist(event, tracklist) {
    const newTracklist = []
    const splitTracklist = tracklist.split('\n')
    var trackNumber = 1
    splitTracklist.forEach(element => {
        // empty variables for Track object
        var name = ''
        var number = ''
        var startTime = ''
        var endTime = ''
        var duration = 0
        // set number
        if (trackNumber < 10) {
            number = "0" + trackNumber.toString()
        } else {
            number = trackNumber.toString()
        }
        trackNumber += 1
        // set name and startTime
        const splittedElement = element.split(' ')
        splittedElement.forEach(element => {
            if (element.includes(':')) {
                startTime = element.trim()
            } else {
                name += element + ' '
            }
        })
        newTracklist.push(new Track(name.trim(), number.trim(), startTime, endTime, duration))
    });
    return setEndTime(newTracklist)
}
// set endTime and duration
function setEndTime(newTracklist) {
    var lastIndex = newTracklist.length - 1
    newTracklist.forEach(function (element, index) {
        // set endTime
        if (index != lastIndex) {
            element.endTime = newTracklist.at(index + 1).startTime
        } else if (index == lastIndex) {
            element.endTime = getLastEndTime()
        }
        // set duration
        element.duration = durationFromTimestamps(element.startTime, element.endTime)
    })
    return checkTrack(newTracklist)
}
// check Track object before sending to ffmpeg
function checkTrack(newTracklist) {
    const errors = []
    newTracklist.forEach(track => {
        // to check name, number, startTime, endTime, duration
        const toCheck = [track.name, track.number, track.startTime, track.endTime, track.duration]
        track.name = track.name.replace(/[&\/\\,+~%.'":*?<>{}]/g, '')
        track.number = track.number.replace(/[&\/\\,+~%.'":*?<>{}]/g, '')
        //check duration
        if (!parseInt(track.duration)) {
            errors.push(track.name + '-timestamp not correct')
        }
        //without : symbol
        track.startTime = track.startTime.replace(/[&\/\\,+~%.'"*?<>{}]/g, '')
        track.endTime = track.endTime.replace(/[&\/\\,+~%.'"*?<>{}]/g, '')
        //check timestamps
        const startTimeWOsymbol = track.startTime.replaceAll(":", '')
        const endTimeWOsymbol = track.endTime.replaceAll(":", '')
        const checkTimestamps = [startTimeWOsymbol, endTimeWOsymbol]
        checkTimestamps.forEach(element => {
            if (isNaN(element)) {
                errors.push(track.name + '-timestamp not correct')
            }
        })
        //check if none or empty
        toCheck.forEach(param => {
            if (!param || param == '') {
                if (track.name == '') {
                    errors.push(['track name not correct'])
                }
                errors.push([track.name + '-timestamp not correct'])
            }
        })
    })
    if (errors.length >= 1) {
        return errors
    } else {
        return ffmpegRun(newTracklist)
    }
}

// process tracks from tracklist and generate ffmpeg command
function ffmpegRun(newTracklist) {
    const dir = createFolder()
    const numberOfElements = newTracklist.length
    newTracklist.forEach(element => {
        ffmpeg(filePathFinal)
            .seekInput(element.startTime)
            .audioBitrate('320k')
            .outputOption('-c copy')
            .outputOptions('-metadata', 'title=' + element.name)
            .outputOptions('-metadata', 'track=' + element.number)
            .outputOptions('-metadata', 'album=' + albumName)
            .duration(element.duration)            
            .on('codecData', data => {
                totalTime = parseInt(data.duration.replace(/:/g, ''))
            })
            .on('end', () => {
                console.log(element.name + ' done')
                const update = element.number + '/' + numberOfElements
                mainWindow.webContents.send('progress-cutting', update)
            })
            .on('error', (err) => {
                console.log(element.name + " " + err.message)
            })
            .save(dir + "\\" + element.number + "." + element.name + '.mp3')
    })
    return 'done'
}