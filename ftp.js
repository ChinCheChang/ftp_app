'use strict'

const jsftp = require('./jsftp')
const aesjs = require('aes-js')
const controller = require('./controller.js')
const config = require('./config')
const fs = require('fs');
const fsPromises = fs.promises;
const homedir = require('os').homedir().replace(/\\/g, '\/');
var FtpObj = undefined
var localList = {}

const ftp = {
  // init: function(btName) {
  //   return new Promise((resolve, reject) => {
  //     if (FtpObj === undefined) {
  //       controller.getNonce()
  //         .then(data => {        
  //           if (data) {
  //             let key = ['@', 'N', 'e', 'w', 'K', 'e', 'n', '_', '1', '6', '9', '9', '9', '5', '9', '9'];
  //             let iv = ['@', 'M', 'e', 'd', 'i', 'C', 'a', 'm', '_', 'F', 'M', '-', '1', '0', '0', '#'];
        
  //             let byteKey = key.map((value) => { return aesjs.utils.utf8.toBytes(value)[0] })
  //             let byteIv = iv.map((value) => { return aesjs.utils.utf8.toBytes(value)[0] })
  //             let encryptedBytes = aesjs.utils.hex.toBytes(data)
  //             let aesCbc = new aesjs.ModeOfOperation.cbc(byteKey, byteIv);
  //             let decryptedBytes = aesCbc.decrypt(encryptedBytes);
  //             let nonce = aesjs.utils.hex.fromBytes(decryptedBytes);
  //             let pw = ''
  //             if (nonce != null && nonce.length == 32) {
  //               pw = nonce.substring(24).toUpperCase();
  //             }

  //             FtpObj = new jsftp({
  //               host: config.getCamera().ip,
  //               user: 'MediCam',
  //               pass: pw,
  //               debugMode: true,
  //               useList: true
  //             })
              
  //             console.log('FTP_init password:', pw)
  //             return FtpObj
  //           }			
  //         })
  //         .then((FtpObj) => {
  //           return fsPromises.readdir(`${homedir}/camera`)
  //             .then(items => {
  //               if (items.indexOf(btName) === -1) {
  //                 fsPromises.mkdir(`${homedir}/camera/${btName}`)
  //                   .then(data => {fsPromises.mkdir(`${homedir}/camera/${btName}/jpg`)})
  //                   .then(data => {fsPromises.mkdir(`${homedir}/camera/${btName}/thumb`)})
  //                   .then(data => {fsPromises.mkdir(`${homedir}/camera/${btName}/video`)})
  //                   .then(data => { resolve(true) })
  //                   .catch(err => {console.log('FTP: failed creating files', err)})
  //               } else {
  //                 this.checkLocalFiles(btName)
  //                 resolve(true)
  //               }         
  //             })
  //             .catch(err => err)
  //         })
  //         .catch(err => {console.log('FTP: failed', err)})
  //     } else {
  //       resolve(true)
  //     }
  //   })
  // },
  listAll: function(args) {
    return new Promise ((resolve, reject) => {
      FtpObj.ls(args[0], (err, res) => {
        if (err) {
          console.log("FTP: List Ftp file name error", err)
          reject(err)
        }

        args[args.length - 1](res);
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
