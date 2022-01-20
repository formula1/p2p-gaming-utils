import React, { Component, useState } from "react";

import WebTorrent, {Torrent} from "webtorrent";

import JSZip from "jszip";

type FileInputProps = {
  value: File | void,
  onChange: (f:File)=>any
}

function FileInput(props: FileInputProps){
  return (
    <div>
      <input
        type="file"
        accept=".zip"
        onChange={function(e){
          console.log(e.target.value);
          console.log(e.target.files);
          props.onChange && props.onChange(e.target.files[0])
        }}
      />
      <DisplayFile file={props.value} />
    </div>
  )
}

type DisplayFileProps = {
  file: File | void
}

type  DisplayFileState = {
  dateBefore: number | void,
  dateAfter: number | void,
  jszip: JSZip | void,
  torrent: Torrent | void,
  files: Array<{
    name: string,
    buffer: ArrayBuffer
  }>
}

class DisplayFile extends Component<DisplayFileProps, DisplayFileState> {
  wtClient = new WebTorrent()

  componentDidMount(){
    if(this.props.file){
      this.updateFileData(this.props.file)
    }else{
      this.setState({
        dateBefore: void 0,
        dateAfter: void 0,
        jszip: void 0,
        torrent: void 0,
        files: []
      })
    }
  }
  componentDidUpdate(prevProps: DisplayFileProps, prevState: DisplayFileState) {
    if(this.props.file === prevProps.file){
      return;
    }
    if(!this.props.file){
      return this.setState({
        dateBefore: void 0,
        dateAfter: void 0,
        jszip: void 0,
        torrent: void 0,
        files: []
      });
    }
    this.updateFileData(this.props.file)
  }
  cleanupFileData(torrent: Torrent){
    return new Promise((res, rej)=>{
      this.wtClient.remove(torrent, { destroyStore: true }, (err)=>{
        console.log("removed torrent:", err);
        if(err) return rej(err);
        res(void 0);
      })
    })
  }
  updateFileData(file: File){
    (
      this.state.torrent ? this.cleanupFileData(this.state.torrent) : Promise.resolve()
    ).then(()=>{
      this.setState({
        torrent: void 0,
        dateBefore: Date.now()
      }, ()=>{
        return Promise.all([
          new Promise((res, rej)=>{
            this.wtClient.seed(file, (torrent)=>{
              console.log("torrent:", torrent);
              res(torrent)
            })
          }),
          JSZip.loadAsync(file, {createFolders: false})
        ]).then(([torrent, zip]: [Torrent, JSZip])=>{
          console.log("unzip:", zip)

          return Promise.all(
            Object.values(zip.files).filter((file)=>{
              return !file.dir
            }).map((file)=>{
              return file.async("arraybuffer").then((buffer)=>{
                return {
                  name: file.name,
                  buffer: buffer
                }
              })
            })
          ).then((loadedFiles)=>{
            this.setState({
              dateAfter: Date.now(),
              torrent: torrent,
              files: loadedFiles,
              jszip: zip
            })
          })
        })
      })
    })
  }

  render(){
    const { state, props } = this;
    if(!props.file){
      return null
    }
    if(!state.jszip){
      return null;
    }

    console.log("props.file:", props.file);
    console.log("state.jszip:", state.jszip);
    console.log("state.files:", state.files);
    return (
      <div>
        <h3>{props.file.name}</h3>
        <ul>
          {
            Object.values(state.jszip.files).map((file, index)=>{
              console.log(file)
              return (
                <li key={index} style={{border: "1px solid"}}>
                  <div><span>Name: </span><span>{file.name}</span></div>
                  <div><span>Is Directory: </span><span>{file.dir.toString()}</span></div>
                  {
                    file.dir ? null :
                    <div><span>Size: </span><span>{(file as any)._data.uncompressedSize.toString()} Bytes</span></div>
                  }
                </li>
              )
          })
        }
        </ul>
      </div>
    )
  }
}

export {
  FileInput
}
