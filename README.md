# audiocutter

Electron desktop Windows application for processing audio files.
Created as a small project to learn electron and javascript.

# functionality
You can use this app to cut large mp3 files to smaller ones (ex. songs) based on provided file/song names and timestamps.
Additionaly if you do not have an audio file you want to cut, you can download a file from a stream link in the app.

<b>Main Window</b> <br>
![screenshot showing main window of the application](/info/001.jpg?raw=true "Main Window") <br>

<b>Add info</b> <br>
Choose an audio file, name for an album, destination folder and add timestamps with track names <br>
![screenshot showing main window of the application with all the information needed to proceed added](/info/002.jpg?raw=true "All info added") <br>

<b>All done</b> <br>
Click "Cut!" button to proceed. Number of tracks and currently processed track will be shown. <br>
![screenshot showing main window of the application with success information](/info/003.jpg?raw=true "All done") <br>

<b>Downloading functionality</b> <br>
You can download audio files from audio or video stream links using this application, but note that most streaming services forbid this. Use it only to obtain content that you have legal rights to.<br>
![screenshot showing second window of the application, it is used for downloading content](/info/004.jpg?raw=true "Download") <br>

# using
Using ffmpeg to process audio files.

Ffmpeg command and audio processing code based on Python Youtube MP3 Splitter
https://gist.github.com/Ashwinning/a9677b5b3afa426667d979b36c019b04

Visual style from W3.CSS
https://www.w3schools.com/
