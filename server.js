const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const manager = require('./manager.js');

const m = manager(
  'mongodb+srv://BrizzAdmin:sF0xMTodOoy7zaTG@brizz-bodhi.mongodb.net/BrizzDB?retryWrites=true&w=majority',
  { useUnifiedTopology: true }
);

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// JWT-----------------------------------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

// JSON Web Token Setup
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

// Configure its options
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

jwtOptions.secretOrKey = 'big-long-string-from-lastpass.com/generatepassword.php';

// Add Support for Incoming JSON Entities
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'JWT'
  ) {
    jwt.verify(req.headers.authorization.split(' ')[1], jwtOptions.secretOrKey, function (
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

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log('payload received', jwt_payload);
  if (jwt_payload) {
    // Attach the token's contents to the request
    // It will be available as "req.user" in the route handler functions
    next(null, {
      _id: jwt_payload._id,
    });
  } else {
    next(null, false);
  }
});

// Activate the security system
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// ***** User Methods *****
// Get One User by Id
app.get('/api/users/:email', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user) {
    const { _id } = req.user;
    // Call the Manager Method
    m.usersGetById(_id)
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: 'Resource not found' });
      });
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
});

// User Create // debugged
app.post('/api/users/create', (req, res) => {
  m.usersRegister(req.body)
    .then((data) => {
      // Configure the payload with data and claims
      const payload = {
        _id: data._id,
        email: data.email,
      };

      const token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: 1000 * 10000000,
      });

      res.json({ message: data, token });
    })
    .catch((msg) => {
      res.status(400).json({ message: msg.message });
    });
});

// User Login // debugged
app.post('/api/users/login', (req, res) => {
  m.usersLogin(req.body)
    .then((data) => {
      // Configure the payload with data and claims
      const payload = {
        _id: data._id,
        email: data.email,
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: 1000 * 10000000,
      });
      // Return the result
      res.json({ message: 'Login was successful', token: token, _id: data._id });
    })
    .catch((msg) => {
      res.status(400).json({ message: msg.message });
    });
});

// User Update // debugged
app.post(
  '/api/users/:email/update',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the manager method
      const { _id } = req.user;
      m.userUpdate(_id, req.body)
        .then((data) => {
          res.json(data);
        })
        .catch((msg) => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

// ***** Program Methods *****
// Get All Programs
app.get('/api/programs', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user) {
    // Call the Manager Method
    m.programGetAll()
      .then((data) => {
        res.json(data);
      })
      .catch(() => {
        res.status(404).json({ message: 'Resource not found' });
      });
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
});

// Get Matched Programs
app.get('/api/programs/matchedprograms/:email', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user) {
    // Call the Manager Method
    const { _id } = req.user;
    m.programGetMatched(_id)
      .then((data) => {
        console.log('data');
        res.json(data);
      })
      .catch((error) => {
        res.status(404).json({ message: error });
      });
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
});

// Get One Program
app.get(
  '/api/programs/:programId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the Manager Method
      m.programGetById(req.params.programId)
        .then((data) => {
          res.json(data);
        })
        .catch(() => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

// Add New Program
app.post('/api/programs', passport.authenticate('jwt', { session: false }), (req, res) => {
  m.programAdd(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

// Edit Program
app.put('/api/programs/:programId', (req, res) => {
  m.programEdit(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ message: 'Program Not Found, Update Failed' });
    });
});

// Delete Program
app.delete('/api/programs/:programId', (req, res) => {
  m.programDelete(req.params.programId)
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      res.status(404).json({ message: 'Program Not Found, Delete Failed' });
    });
});

// ***** Admin Methods *****
// Get One Admin by Id
app.get('/api/admins/:adminId', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Call the Manager Method
  m.adminGetById(req.params.adminId)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ message: 'Resource not found' });
    });
});

// Admin Create // debugged
app.post('/api/admins/create', (req, res) => {
  m.adminRegister(req.body)
    .then((data) => {
      // Configure the payload with data and claims
      const payload = {
        _id: data._id,
        email: data.email,
      };

      const token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: 1000 * 10000000,
      });

      res.json({ message: data, token });
    })
    .catch((msg) => {
      res.status(400).json({ message: msg.message });
    });
});

// Admin Login // debugged
app.post('/api/admins/login', (req, res) => {
  m.adminLogin(req.body)
    .then((data) => {
      // Configure the payload with data and claims
      const payload = {
        _id: data._id,
        email: data.email,
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: 1000 * 10000000,
      });
      // Return the result
      res.json({ message: 'Login was successful', token: token, _id: data._id });
    })
    .catch((msg) => {
      res.status(400).json({ message: msg.message });
    });
});

// Admin Update // debugged
app.post(
  '/api/admins/:email/update',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the manager method
      const { _id } = req.user;
      m.adminUpdate(_id, req.body)
        .then((data) => {
          res.json(data);
        })
        .catch((msg) => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

// Admin Update Temp Programs // debugged
app.put(
  '/api/admins/:adminID/updateProgramTemp',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the manager method
      console.log(req.body);
      m.adminCartSave(req.params.adminID, req.body)
        .then((data) => {
          res.json(data);
        })
        .catch((msg) => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

// Admin Update Temp Programs // debugged
app.put(
  '/api/admins/:adminID/updateProgramFull',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the manager method
      m.adminCartSaveFull(req.params.adminID, req.body)
        .then((data) => {
          res.json(data);
        })
        .catch((msg) => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);
// Admin Password Reset
app.put('/api/admins/:passwordReset', (req, res) => {
  var newPassword = makePassword(6);
  m.adminPassReset(req.params.passwordReset, newPassword)
    .then((data) => {
      var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: 'devbrizz@hotmail.com',
          pass: 'eIc^XxvzuPld',
        },
      });
      var mailOptions = {
        to: data.email,
        from: 'devbrizz@hotmail.com',
        subject: 'Admin Password Reset',
        text:
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Your new password is: ' +
          newPassword +
          '\n\n' +
          'Use this Password as your new password to log into the Admin Website.\n',
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.json(data);
    })
    .catch((msg) => {
      res.status(404).json({ message: 'Resource not found' });
    });
});

// -------------- Questionnaire --------------

// save questionnaire results
app.post(
  '/api/users/:email/updateresults',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.user) {
      // Call the manager method
      const { _id } = req.user;
      m.userSaveResults(_id, req.body)
        .then((data) => {
          res.json(data);
        })
        .catch((msg) => {
          res.status(404).json({ message: 'Resource not found' });
        });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

// Attempt to Connect to the Database, Start Listening for Requests
m.connect()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log('Ready to handle requests on port ' + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log('Unable to start the server:\n' + err);
    process.exit();
  });

function makePassword(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
