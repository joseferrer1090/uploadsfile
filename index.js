const { response, json } = require("express");
const express = require("express");
const app = new express();
const qr = require("qrcode");
const fs = require("fs.extra");
const Yup = require("yup");
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

  // Este es el que genera la imagen
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

  // Este Es el que imprime en la console
  qr.toString(obj, (err, code) => {
    if(err){
      return console.log("Error => ", err);
    } else {
      console.log(code)
    }
  })
});

// Login con OAUTH 2.0 y passportjs --> intentando <--

// Implementado Yup para validar el login del usuar
const login_post = Yup.object({
  body: Yup.object({
    username: Yup.string().required(),
    password: Yup.string().required(),
    grand_type: Yup.string().required()
  })
});

// Se crea un middleware para capturar la data del POST del login
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body
    });
    console.log("Entre por este lado");
    return next();
  } catch (error) {
    return res.status(500).json({
      type: error.type,
      message: error.message
    });
  }
}


app.post("/login", validate(login_post), (req, res) => {
  console.log("res => ", res);
  console.log("req => ", req.body);
  return res.json({
    message: req.body
  })
});


app.listen(port, ()=> {
    console.log(`El api esta corriendo en el puerto ${port}`);
})