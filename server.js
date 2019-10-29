const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const manager = require("./manager.js");

const m = manager(
  "mongodb+srv://BrizzAdmin:You5iv3LkoJFF1cK@brizz-bodhi.mongodb.net/BrizzDB?retryWrites=true&w=majority",
    { useUnifiedTopology: true },
    () => console.log("Connected to DB")
);

app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


//JWT-----------------------------------------------------------------------------------------------------
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");

// JSON Web Token Setup
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// Configure its options
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");

jwtOptions.secretOrKey = 'big-long-string-from-lastpass.com/generatepassword.php';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {
    // Attach the token's contents to the request
    // It will be available as "req.user" in the route handler functions
        next(null, {
            _id: jwt_payload._id
        });
    } else {
        next(null, false);
    }
});
// Activate the security system
passport.use(strategy);
app.use(passport.initialize());

// ***** User Methods *****

// Get All Users
app.get(
  "/api/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Call the Manager Method
    m.usersGetAll()
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
    m.usersGetById(req.params.userId)
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
    m.usersGetByUsername(req.params.username)
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
