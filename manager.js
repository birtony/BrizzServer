// Setup
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

// Load the Schemas
const userSchema = require('./msc-user.js');
const ProgramSchema = require('./msc-program.js');

module.exports = function (mongoDBConnectionString) {
  // Defined on Connection to the New Database
  let Users;
  let Programs;

  return {
    // Establish Connection With the Database
    connect: function () {
      return new Promise(function (resolve, reject) {
        const db = mongoose.createConnection(mongoDBConnectionString);
        db.on('error', (error) => {
          reject(error);
        });

        db.once('open', () => {
          Users = db.model('Users', userSchema, 'user');
          Programs = db.model('Programs', ProgramSchema, 'program');
          resolve();
        });
      });
    },

    // Get One User By Id
    usersGetById: function (itemId) {
      return new Promise(function (resolve, reject) {
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
            return reject(new Error('Not found'));
          }
        });
      });
    },

    // Users Register
    usersRegister: function (userData) {
      // debugged
      return new Promise(function (resolve, reject) {
        // Incoming data package has user name (email address), full name,
        // two identical passwords
        // { email: xxx, password: yyy, passwordConfirm: yyy }

        // check if passwords match
        if (userData.password !== userData.passwordConfirm) {
          reject(new Error('Passwords do not match'));
        }

        // Generate a "salt" value
        const salt = bcrypt.genSaltSync(10);
        // Hash the result
        const hash = bcrypt.hashSync(userData.password, salt);

        // Update the incoming data
        userData.password = hash;

        // Create a new user account document
        const newUser = new Users(userData);

        // Attempt to save
        newUser.save((error) => {
          if (error) {
            if (error.code === 11000) {
              reject(new Error('User creation - cannot create; user already exists'));
            } else {
              reject(new Error(`User creation - ${error.message}`));
            }
          } else {
            resolve(newUser);
          }
        }); // newUser.save
      }); // return new Promise
    }, // usersRegister

    // Users login // debugged
    usersLogin: function (userData) {
      return new Promise(function (resolve, reject) {
        // Incoming data package has user name (email address) and password
        // { email: xxx, password: yyy }
        Users.findOne({ email: userData.email }, (error, item) => {
          if (error) {
            // Query error
            return reject(new Error(`Login - ${error.message}`));
          }
          // Check for an item
          if (item) {
            // Compare password with stored value
            const isPasswordMatch = bcrypt.compareSync(userData.password, item.password);
            if (isPasswordMatch) {
              return resolve(item);
            } else {
              return reject(new Error('Login was not successful'));
            }
          } else {
            return reject(new Error('Login - not found'));
          }
        }); // Users.findOneAndUpdate
      }); // return new Promise
    }, // usersLogin

    // User Update // debugged
    userUpdate: function (_id, user) {
      return new Promise(function (resolve, reject) {
        Users.findByIdAndUpdate(_id, user, { new: true }, (error, item) => {
          if (error) {
            // Cannot edit item
            return reject(error.message);
          }
          // Check for an item
          if (item) {
            // Success message will be returned
            return resolve('User updated');
          } else {
            return reject(new Error('Not found'));
          }
        });
      });
    },

    // *** Program Functions ***

    // Get All Programs
    programGetAll: function () {
      return new Promise(function (resolve, reject) {
        // Fetch All Documents
        Programs.find()
          .sort({ name: 'asc' })
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
    programGetById: function (itemId) {
      return new Promise(function (resolve, reject) {
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
            return reject('Not found');
          }
        });
      });
    }
  };
};
