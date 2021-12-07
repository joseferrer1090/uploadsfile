const { response, json } = require("express");
const express = require("express");
const qr = require("qrcode");
const app = new express();
const fs = require("fs.extra");
const multer = require("multer");
const uploadFolder = __dirname + "/uploads/";
const tempFolder = __dirname + '/tmp/';


const upload = multer({dest: uploadFolder});
const port = 3000;

app.use(express.json()); // JSON 

app.use(express.urlencoded({ // URLENCODE
  extended: true
}));

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

// Generate QR code 
app.post("/generate", (req, res) => {
  
  const nombre = req.body.nombre;
  const identificacion = req.body.identificacion;

  const obj = JSON.stringify({
    "nombre": nombre,
    "identificacion": identificacion
  });

  console.log(obj);

  

  qr.toDataURL(obj, (err, code)=> {
    if(err){ 
      return console.log("Error en el qr => ", err)
    } else {
      res.status(200).json({
        success: true,
        value: code
      })
      console.log(code);
    }
  });
});


app.listen(port, ()=> {
    console.log(`El api esta corriendo en el puerto ${port}`);
})