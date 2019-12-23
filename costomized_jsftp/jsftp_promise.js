'use strict'

const fs = require('fs');
const fsPromises = fs.promises;
const homedir = require('os').homedir().replace(/\\/g, '\/');
var FtpObj = undefined
var localList = {}

const ftp = {
  listAll: function(args) {
    return new Promise ((resolve, reject) => {
      FtpObj.ls(args[0], (err, res) => {
        if (err) {
          console.log("FTP: List Ftp file name error", err)
          reject(err)
        }

        console.log(res)
        //args[args.length - 1](res);
        resolve(res)
      })
    })        
  },
  getFile: function(args) {
    let { name, path, mtimeMs, btName } = args[0]    
    let win =  args[1]   
    let remotePath = `${path}/${name}`
    let localPath = `${homedir}/camera/${btName}/${path.replace('./','')}/${name}`
    let checkLocalfileList = localList[`${path.replace('./','')}List`].indexOf(name) === -1

    let getFilePromise = (remotePath, localPath) => {
      return new Promise((resolve, reject) => {
        FtpObj.get(remotePath, localPath, win, name, (err, res) => {
          if (err) {
            reject(err)   
            throw err          
          } else {
            resolve(res)            
          }
        })
      })
    }

    let setMTimePromise = (localPath, mtimeMs, name) => {
      return new Promise((resolve ,reject) => {
        fs.utimes(localPath, new Date(mtimeMs), new Date(mtimeMs), (err, res) => {
          if (err) {             
             reject("Failed to update time: " + name, err)
             throw err  
          } 
          
          resolve(res)
        })
      })
    }

    return new Promise ((resolve, reject) => {
      if (checkLocalfileList) {
        getFilePromise(remotePath, localPath)
          .then((res) => setMTimePromise(localPath, mtimeMs, name))
          .then((res) => {
            args[args.length - 1](res);
            resolve(res)
          })
          .catch(err => {
            console.error( 'Get File error ', {
              type: 'getFile',
              name, 
              path, 
              mtimeMs, 
              btName,
              error: err 
            })
            reject(err)
          })
      } else {
        console.log("FTP: file already exists", remotePath)
        resolve(true)  
      } 
    })          
  },  
  checkLocalFiles: function(btName) {
    return fsPromises.readdir(`${homedir}/camera/${btName}/jpg`)
      .then((dirList) => {
        localList.jpgList = dirList;
        return fsPromises.readdir(`${homedir}/camera/${btName}/thumb`)
      }) 
      .then((dirList) => {
        localList.thumbList = dirList;
        return fsPromises.readdir(`${homedir}/camera/${btName}/video`)
      })
      .then((dirList) => {
        localList.videoList = dirList;
        return dirList
      })
      .catch(err => err)
  },
  taskDone: function(args) {
    return new Promise ((resolve, reject) => {
      args[args.length - 1]();
      resolve(true)
    }) 
  },
  deleteFile: function(args) {
    return new Promise((resolve, reject) => {  
      FtpObj.raw('dele', args[0], (err, res) => {
        if (err) {          
          reject(err)
        }      
        //controller callback
        args[args.length - 1](args[0]);
        //worker callback
        resolve(true)
      })     
       
    })
  }
}

module.exports = ftp;
