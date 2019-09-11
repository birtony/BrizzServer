// Setup
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);

// Load the Schemas
const userSchema = require("./msc-user.js");
const ProgramSchema = require("./msc-program.js");

module.exports = function(mongoDBConnectionString) {
  // Defined on Connection to the New Database
  let Users;
  let Programs;

  return {
    // Establish Connection With the Database
    connect: function() {
      return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString);

        db.on("error", error => {
          reject(error);
        });

        db.once("open", () => {
          Users = db.model("Users", userSchema, "user");
          Programs = db.model("Programs", ProgramSchema, "program");
          resolve();
        });
      });
    },

    // Get All Users
    usersGetAll: function() {
      return new Promise(function(resolve, reject) {
        // Fetch All Documents
        Users.find()
          .sort({ lastName: "asc", firstName: "asc" })
          .exec((error, items) => {
            if (error) {
              // Query Error
              return reject(error.message);
            }
            // If Found, a Collection Will Be Returned
            return resolve(items);
          });
      });
    },

    // Get One User By Id
    usersGetById: function(itemId) {
      return new Promise(function(resolve, reject) {
        // Find One Specific Document
        Users.findById(itemId, (error, item) => {
          if (error) {
            // Match Is Not Found
            return reject(error.message);
          }
          // Check For an Item
          if (item) {
            // If Found, One Object Will Be Returned
            return resolve(item);
          } else {
            return reject("Not found");
          }
        });
      });
    },

    // Get One User By Username
    usersGetByUsername: function(username) {
      return new Promise(function(resolve, reject) {
        // Find One Specific Document
        Users.findOne({ username: username }, (error, item) => {
          if (error) {
            // Match Is Not Found
            return reject(error.message);
          }
          // Check For an Item
          if (item) {
            // If Found, One Object Will Be Returned
            return resolve(item);
          } else {
            return reject("Not found");
          }
        });
      });
    },

    // User Activate
    usersActivate: function(userData) {
      return new Promise(function(resolve, reject) {
        // Incoming data package has username (email address),
        // two identical passwords
        // { userName: xxx, password: yyy, passwordConfirm: yyy }

        if (userData.password != userData.passwordConfirm) {
          return reject("Passwords do not match");
        }

        // Generate a "salt" value
        var salt = bcrypt.genSaltSync(10);
        // Hash the result
        var hash = bcrypt.hashSync(userData.password, salt);

        // Attempt to update the user account
        Users.findOneAndUpdate(
          { username: userData.username },
          { password: hash, statusActivated: true },
          { new: true },
          (error, item) => {
            if (error) {
              // Cannot edit item
              return reject(`User activation - ${error.message}`);
            }
            // Check for an item
            if (item) {
              // Edited object will be returned
              //return resolve(item);
              // Alternatively...
              return resolve("User was activated");
            } else {
              return reject("User activation - not found");
            }
          }
        ); // Users.findOneAndUpdate
      }); // return new Promise
    }, // usersActivate

    // Users Register
    usersRegister: function(userData) {
      return new Promise(function(resolve, reject) {
        // Incoming data package has user name (email address), full name,
        // two identical passwords
        // { userName: xxx, fullName: aaa, password: yyy, passwordConfirm: yyy }

        if (userData.password != userData.passwordConfirm) {
          return reject("Passwords do not match");
        }

        // Generate a "salt" value
        var salt = bcrypt.genSaltSync(10);
        // Hash the result
        var hash = bcrypt.hashSync(userData.password, salt);

        // Update the incoming data
        userData.password = hash;

        // Create a new user account document
        let newUser = new Users(userData);

        // Attempt to save
        newUser.save(error => {
          if (error) {
            if (error.code == 11000) {
              reject("User creation - cannot create; user already exists");
            } else {
              reject(`User creation - ${error.message}`);
            }
          } else {
            resolve(newUser);
          }
        }); //newUser.save
      }); // return new Promise
    }, // usersRegister

    // Users
    usersLogin: function(userData) {
      return new Promise(function(resolve, reject) {
        console.log(userData);
        // Incoming data package has user name (email address) and password
        // { userName: xxx, password: yyy }

        Users.findOne({ username: userData.username }, (error, item) => {
          if (error) {
            // Query error
            return reject(`Login - ${error.message}`);
          }
          // Check for an item
          if (item) {
            // Compare password with stored value
            let isPasswordMatch = bcrypt.compareSync(
              userData.password,
              item.password
            );
            if (isPasswordMatch) {
              return resolve(item);
            } else {
              return reject("Login was not successful");
            }
          } else {
            return reject("Login - not found");
          }
        }); // Users.findOneAndUpdate
      }); // return new Promise
    }, // usersLogin

    // User Update
    userUpdate: function(_id, user) {
      return new Promise(function(resolve, reject) {
        Users.findByIdAndUpdate(_id, user, { new: true }, (error, item) => {
          if (error) {
            // Cannot edit item
            return reject(error.message);
          }
          // Check for an item
          if (item) {
            // Success message will be returned
            return resolve("User updated");
          } else {
            return reject("Not found");
          }
        });
      });
    },

    // *** Program Functions ***

    // Get All Programs
    programGetAll: function() {
      return new Promise(function(resolve, reject) {
        // Fetch All Documents
        Programs.find()
          .sort({ name: "asc" })
          .exec((error, items) => {
            if (error) {
              // Query Error
              return reject(error.message);
            }
            // If Found, a Collection Will Be Returned
            return resolve(items);
          });
      });
    },

    // Get One Center By Id
    programGetById: function(itemId) {
      return new Promise(function(resolve, reject) {
        // Find One Specific Document
        Programs.findById(itemId, (error, item) => {
          if (error) {
            // Match Is Not Found
            return reject(error.message);
          }
          // Check For an Item
          if (item) {
            // If Found, One Object Will Be Returned
            return resolve(item);
          } else {
            return reject("Not found");
          }
        });
      });
    },

    // Check for complete
    complete: function(_id) {
      return new Promise(function(resolve, reject) {
        Users.findById(_id, (error, item) => {
          if (error) {
            // Match Is Not Found
            return reject(error.message);
          }
          // Check For an Item
          if (item) {
            // If Found, One Object Will Be Returned
            return resolve(item.complete);
          } else {
            return reject("Not found");
          }
        });
      });
    }
  };
};
