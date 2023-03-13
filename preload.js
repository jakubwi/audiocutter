const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    setTracklist: (tracklist) => ipcRenderer.invoke('set-tracklist', tracklist),
    setAlbum: (album) => ipcRenderer.send('set-album', album),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openDir: () => ipcRenderer.invoke('dialog:openDirectory'),
})