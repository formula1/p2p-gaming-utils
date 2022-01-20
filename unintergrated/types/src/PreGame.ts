
enum DownloadStatus {
  Init = "Init",
  Downloading = "Downloading",
  Proving = "Proving",
  Ready = "Ready"
}

type PlayerStatus = {
  id: string,
  name: string,
  ping: number,
  downloaded: DownloadStatus
}

export {
  PlayerStatus
}
