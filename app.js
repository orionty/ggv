const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require("express-session")
const path = require("path")
const pino = require('express-pino-logger')();
const nodemailer = require('nodemailer')
require('dotenv').config();



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});


const PORT = process.env.PORT || 3001;

const app = express()
app.use(cors())

app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    })
  );

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
app.use(pino);
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // handle OPTIONS method
    if ('OPTIONS' == req.method) {
        return res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.static("public"));
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));


app.get("/",(req,res) => {
  res.send("Hello API");
})


// mail-service option
app.post("/mail-service", (req, res,next) => {
  console.log(req.body);

  //transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:process.env.EMAIL,
      pass:process.env.PASSWORD,
    },
  });

  const message = `Name: ${req.body.mailName} \n\n Email: ${req.body.mailEmail} \n\n Message: ${req.body.address}`;
  //mailOption
  const mailOption = {
    from: process.env.EMAIL,
    to: req.body.mailEmail,
    text: message,
  };
  //sendMail
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log(error);
      res.send("Error!! message not sent Successfully!");
    } else {
      console.log("Email sent: " + info.response);
      res.send("success");
    }
  });
});

// email option
app.post("/send/mail", (req, res,next) => {
  console.log(req.body);

//   //transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user:process.env.EMAIL,
//       pass:process.env.PASSWORD,
//     },
//   });

  const message = `Name: ${req.body.name} \n\n Email: ${req.body.ContactEmail} \n\n Message: ${req.body.message}`;
  //mailOption
  const mailOption = {
    from: req.body.ContactEmail ,
    to: process.env.EMAIL ,
    text: message,
  };
  //sendMail
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log(error);
      res.send("Error!! message not sent Successfully!");
    } else {
      console.log("Email sent: " + info.response);
      res.send("success");
    }
  });
});


// mail
app.post("/mail", (req, res, next) => {
  const email = req.body.email;
  const message = `First Name: ${req.body.firstname} \n\n Last Name: ${req.body.lastname}\n\n Email: ${req.body.email} \n\n Message: ${req.body.message}`;

  var mail = {
    from: email,
    to: process.env.EMAIL,
    text: message,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "Sent Successfully!",
      });
    }
  });
});


app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
