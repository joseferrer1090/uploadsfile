const { response } = require("express");
const express = require("express");
const app = new express();
const fs = require("fs.extra");
const multer = require("multer");
const uploadFolder = __dirname + "/uploads/";
const tempFolder = __dirname + '/tmp/';

const upload = multer({dest: uploadFolder});
const port = 3000;


app.get("/", (req, res) => {
    res.json({
        success: true, 
        message: "api funcionando bien"
    });
});


// Process upload file
app.post('/file_upload', upload.single('single-file'), function(request, response) {

  var fileName = request.file.originalname; // original file name
  var file = request.file.path; // real file path with temporary name

  // renaming real file to it's original name
  fs.move(file, uploadFolder + fileName, function (err) {
    if (err) {
      console.log(err);
      response.json({success:false, message: err});
      return;
    }
    response.json({success:true, message: 'File uploaded successfully', fileName: fileName});
  });
});


app.listen(port, ()=> {
    console.log(`El api esta corriendo en el puerto ${port}`);
})