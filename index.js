'use strict'

const FtpController = require('./ftp_controller')

const App = new FtpController({
  nedb: {
		filename: './db/medicam',
    autoload: true
	}
})
for (let i=0; i < 100; i++) {
  App.list('./jpg')
}

//App.get('./jpg')
// App.FTP.get('./jpg/award_fm100.png', './award_fm100.png',  (err) => {
//     if (err) {
//       console.log("download error", err)   
//       throw err          
//     } else {      
//     }

//     console.log("download compelete")
//   })