const jsftp = require('jsftp')
const once = require("once");
const fs = require("fs");

const cust_jsftp = function(cfg) {
    const FTP = new jsftp(cfg)

    FTP.__proto__.get = function(remotePath, localPath, callback = NOOP) {
        let finalCallback;
        const typeofLocalPath = typeof localPath;
    
        if (typeofLocalPath === "function") {
            finalCallback = localPath;
        } else if (typeofLocalPath === "string") {
            callback = once(callback);
            finalCallback = (err, socket) => {
                if (err) {
                    return callback(err);
                }
    
                const writeStream = fs.createWriteStream(localPath);
                writeStream.on("error", callback);
    
                socket.on("readable", () => {
                    this.emitProgress({
                        filename: remotePath,
                        action: "get",
                        socket: socket
                    });
    
                    socket.read()
                });
    
                // This ensures that any expected outcome is handled. There is no
                // danger of the callback being executed several times, because it is
                // wrapped in `once`.
                socket.on("error", callback);
                socket.on("end", callback);
                socket.on("close", callback);
    
                socket.pipe(writeStream);
            };
        }
    
        this.getGetSocket(remotePath, once(finalCallback));
    };

    return FTP
}

module.exports = cust_jsftp


