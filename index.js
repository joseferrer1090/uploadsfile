const { response, json } = require("express");
const express = require("express");
const app = new express();
const qr = require("qrcode");
const fs = require("fs.extra");
const Yup = require("yup");
const multer = require("multer");
const uploadFolder = __dirname + "/uploads/";
const tempFolder = __dirname + '/tmp/';
const sqlite3 = require("sqlite3").verbose();
const path = require("path");


const upload = multer({ dest: uploadFolder });
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
app.post('/file_upload', upload.single('single-file'), function (request, response) {

  var fileName = request.file.originalname; // original file name
  var file = request.file.path; // real file path with temporary name

  // renaming real file to it's original name
  fs.move(file, uploadFolder + fileName, function (err) {
    if (err) {
      console.log(err);
      response.json({ success: false, message: err });
      return;
    }
    response.json({ success: true, message: 'File uploaded successfully', fileName: fileName });
  });
});

// Generate QR code 
app.post("/generate", (req, res) => {

  const id = req.body.id;
  const url_search = `https://sig.ises.com.co/sig4prueba/Informeticket/equipo/${id}`;

  const obj = JSON.stringify({
    url: url_search,
  });

  console.log(obj);

  const db = new sqlite3.Database("./db/db_qr.sqlite", sqlite3.OPEN_READWRITE, (err) => { console.log("Error => ", err) });

  let sql_ = `select * from qrs where id_activo = ?`;
  let params = id;
  const extis = 0;

  db.get(sql_, [Number(params)], (err, row) => {
    if(row){
      extis = 1;
    } 
  });


  // Este es el que genera la imagen esta imagen se guarda en una base de datos ligera SQLITE
  qr.toDataURL(obj, (err, code) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      if(extis == 0){
        db.run("INSERT INTO qrs(data, id_activo) values (?, ?)", [JSON.stringify(code), id])
        db.close();
        res.status(200).json({
          message: "Se creo el qr",
          code: code,
          id_activo: id
        });
      }
    }
  });

  // Este Es el que imprime en la console para probar
  qr.toString(obj, (err, code) => {
    if (err) {
      return console.log("Error => ", err);
    } else {
      console.log(code)
    }
  })

});

// Consultar el QR, por el id de activo.
app.get("/qr/:id", async (req, res) => {
  const id = req.params.id;
  const db2 = new sqlite3.Database("./db/db_qr.sqlite", sqlite3.OPEN_READWRITE, (err) => { console.log("Error => ", err) });

  let sql = `Select * from qrs where id_activo = ?`;

  await db2.get(sql, [Number(id)], (err, row) => {
    if (err) {
     res.status(500).json({
        message: err,
        code: 500
      });
    }
     res.status(200).json({
      id: id,
      result: {
        id: row.id,
        id_activo: row.id_activo,
        data: JSON.parse(row.data)
      }
    })
  })
  db2.close();
})


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


app.listen(port, () => {
  console.log(`El api esta corriendo en el puerto ${port}`);
})