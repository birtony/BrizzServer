// Setup
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const HTTP_PORT = process.env.PORT || 8080;

// Add Support for CORS
app.use(cors());

// Passport.js components
var jwt = require("jsonwebtoken");
var passport = require("passport");
var passportJWT = require("passport-jwt");

// JSON Web Token Setup
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// Configure its options
var jwtOptions = {};
// jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// IMPORTANT - this secret should be a long, unguessable string
// (ideally stored in a "protected storage" area on the
// web server, a topic that is beyond the scope of this course)
// We suggest that you generate a random 64-character string
// using the following online tool:
// https://lastpass.com/generatepassword.php
const secretOrKey = "big-long-string-from-lastpass.com/generatepassword.php";

// Add Support for Incoming JSON Entities
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(req.headers.authorization.split(" ")[1], secretOrKey, function(
      err,
      decode
    ) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use(function(req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

// Activate the security system

app.use((req, res, next) => {
  if (req.body) console.log("req.body:\n", req.body);
  if (req.headers) console.log("req.headers:\n", req.headers);
  if (req.query) console.log("req.query:\n", req.query);
  console.log(`Received a ${req.method} request from ${req.ip} for ${req.url}`);
  next();
});

// Data Model
const manager = require("./manager.js");

// Persistent Store
// For MondoDB Atlas Database
const m = manager(
  "mongodb+srv://BrizzAdmin:hP0BsTS7PXWFWZj1@brizz-bodhi.mongodb.net/BrizzDB?retryWrites=true&w=majority"
);

// App's Home Page for Browser Clients
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// ***** User Methods *****

// Get All Users
app.get(
  "/api/users",
  passport.authenticate("jwt", { session: false, failureFlash: true }),
  (req, res) => {
    // Call the Manager Method
    m.userGetAll()
      .then(data => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  }
);

// Get One User by Id
app.get(
  "/api/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Call the Manager Method
    m.userGetById(req.params.userId)
      .then(data => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  }
);

// Get One User by Username
app.get(
  "/api/users/username/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Call the Manager Method
    m.centerGetByUsername(req.params.username)
      .then(data => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  }
);

// User Activate
app.post("/api/users/activate", (req, res) => {
  m.usersActivate(req.body)
    .then(data => {
      res.json({ message: data });
    })
    .catch(msg => {
      res.status(400).json({ message: msg });
    });
});

// User Create
app.post("/api/users/create", (req, res) => {
  m.usersRegister(req.body)
    .then(data => {
      // Configure the payload with data and claims
      var payload = {
        _id: data._id,
        username: data.username
      };
      var token = jwt.sign(payload, secretOrKey, {
        expiresIn: 1000 * 10000000
      });
      res.json({ message: data, token });
    })
    .catch(msg => {
      res.status(400).json({ message: msg });
    });
});

// User Login
app.post("/api/users/login", (req, res) => {
  m.usersLogin(req.body)
    .then(data => {
      // Configure the payload with data and claims
      var payload = {
        _id: data._id,
        username: data.username
      };
      const complete = m.complete(payload._id);
      var token = jwt.sign(payload, secretOrKey, {
        expiresIn: 1000 * 10000000
      });
      // Return the result
      res.json({ message: "Login was successful", token: token, complete });
    })
    .catch(msg => {
      res.status(400).json({ message: msg });
    });
});

// User Update
app.post("/api/users/:username/update", (req, res) => {
  if (req.user) {
    // Call the manager method
    const { _id } = req.user;
    m.userUpdate(_id, req.body)
      .then(data => {
        res.json({ message: "User updated" });
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// ***** Program Methods *****

// Get All Programs
app.get("/api/programs", (req, res) => {
  if (req.user) {
    // Call the Manager Method
    m.programGetAll()
      .then(data => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// Get One Program
app.get("/api/programs/:programId", (req, res) => {
  if (req.user) {
    // Call the Manager Method
    m.programGetById(req.params.programId)
      .then(data => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: "Resource not found" });
      });
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

// Attempt to Connect to the Database, Start Listening for Requests
m.connect()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Ready to handle requests on port " + HTTP_PORT);
    });
  })
  .catch(err => {
    console.log("Unable to start the server:\n" + err);
    process.exit();
  });
