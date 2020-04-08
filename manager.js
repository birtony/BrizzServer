// Setup
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

// Load the Schemas
const userSchema = require('./msc-user.js');
const ProgramSchema = require('./msc-program.js');
const adminSchema = require('./msc-admin');

module.exports = function (mongoDBConnectionString) {
  // Defined on Connection to the New Database
  let Users;
  let Programs;
  let Admins;

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
          Admins = db.model('Admins', adminSchema, 'admins');
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
          return reject(new Error('Passwords do not match'));
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

    // User Save results of the questionnaire
    userSaveResults: function (_id, user) {
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

    //Full User Cart Save
    userCartSaveFinal: function (_id, CourseArray) {
      var wrappedItem = { finalPrograms: CourseArray };
      return new Promise(function (resolve, reject) {
        Users.findByIdAndUpdate(_id, wrappedItem, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
          }
        });
      });
    },

    //Temporary User Cart Save
    userCartSave: function (_id, CourseArray) {
      var wrappedItem = { tempPrograms: CourseArray };
      return new Promise(function (resolve, reject) {
        Users.findByIdAndUpdate(_id, wrappedItem, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
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

    // Get Matched Programs
    programGetMatched: function (userID) {
      return new Promise(function (resolve, reject) {
        let tag, user;

        async function getUser() {
          let promise = new Promise(function (resolve, reject) {
            Users.findById(userID, (error, item) => {
              if (error) {
                // Match Is Not Found
                console.log('1 ne nashel usera');
                reject(error.message);
              }
              // Check For an Item
              if (item) {
                // If Found, One Object Will Be Returned
                user = item;
                resolve(item);
              } else {
                console.log('hz');
                reject(new Error('User not found'));
              }
            });
          });

          let result = await promise;
          return result;
        }

        getUser()
          .then(() => {
            let results = [],
              data = [],
              part1 = [],
              part2 = [],
              part3 = [],
              part4 = [];

            async function getPrograms() {
              let getPart1 = new Promise(function (resolve, reject) {
                tag = user.interests.i1.raisecTag[0];
                console.log('p1 tag = ' + tag);

                // Fetch Documents that match first interest
                tag = '^' + tag;
                let re = new RegExp(tag);
                Programs.find({ categoryTag: { $regex: re } })
                  .sort({ name: 'asc' })
                  .exec((error, items) => {
                    data = items;
                    //console.log('items 1 = ' + items);

                    resolve(1);
                  });
              });

              let getPart2 = new Promise(function (resolve, reject) {
                tag = user.interests.i2.raisecTag[0] + user.interests.i1.raisecTag[0];
                console.log('p2 tag = ' + tag);

                tag = '^' + tag;
                let re = new RegExp(tag);
                // Fetch Documents that match first two interests swapped
                Programs.find({ categoryTag: { $regex: re } })
                  .sort({ name: 'asc' })
                  .exec((error, items) => {
                    if (error) reject(error);

                    part2 = items;
                    //console.log('items 2 = ' + items);
                    resolve(1);
                  });
              });

              await getPart1;
              await getPart2;

              console.log('data1 = ' + data);
              console.log('data2 = ' + part2);

              return;
            }

            getPrograms()
              .then(() => {
                console.log('data =' + data);

                for (itm of data) {
                  if (itm.categoryTag[1] === user.interests.i2.raisecTag[0]) {
                    if (itm.categoryTag[2] === user.interests.i3.raisecTag[0]) {
                      part1.push(itm);
                    } else {
                      part3.push(itm);
                    }
                  } else {
                    part4.push(itm);
                  }
                }

                results = [...part1, ...part3, ...part2, ...part4];

                if (results.length === 0) {
                  return reject('No Programs Found');
                } else return resolve(results);
              })
              .catch((error) => {
                return reject(error);
              });
          })
          .catch((error) => {
            return reject(error);
          });
      });
    },

    // Get One Program By Id
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
    },

    // Add new Program
    programAdd: function (someId) {
      return new Promise(function (resolve, reject) {
        Programs.create(someId, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          return resolve(object);
        });
      });
    },

    // Edit a Program
    programEdit: function (someId) {
      return new Promise(function (resolve, reject) {
        Programs.findByIdAndUpdate(someId._id, someId, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
          }
        });
      });
    },

    // Delete a Program
    programDelete: function (someId) {
      return new Promise(function (resolve, reject) {
        Programs.findByIdAndRemove(someId, (error) => {
          if (error) {
            return reject(error.message);
          }
          return resolve();
        });
      });
    },

    // Admin Functions
    // Get One User By Id
    adminGetById: function (itemId) {
      return new Promise(function (resolve, reject) {
        // Find One Specific Document
        Admins.findById(itemId, (error, item) => {
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
    adminRegister: function (adminData) {
      // debugged
      return new Promise(function (resolve, reject) {
        // Incoming data package has user name (email address), full name,
        // two identical passwords
        // { email: xxx, password: yyy, passwordConfirm: yyy }

        // check if passwords match
        if (adminData.password !== adminData.passwordConfirm) {
          return reject(new Error('Passwords do not match'));
        }

        // Generate a "salt" value
        const salt = bcrypt.genSaltSync(10);
        // Hash the result
        const hash = bcrypt.hashSync(adminData.password, salt);

        // Update the incoming data
        adminData.password = hash;

        // Create a new user account document
        const newAdmin = new Admins(adminData);

        // Attempt to save
        newAdmin.save((error) => {
          if (error) {
            if (error.code === 11000) {
              reject(new Error('Admin creation - cannot create; admin already exists'));
            } else {
              reject(new Error(`Admin creation - ${error.message}`));
            }
          } else {
            resolve(newAdmin);
          }
        }); // newAdmin.save
      }); // return new Promise
    }, // adminRegister

    // Users login // debugged
    adminLogin: function (adminData) {
      return new Promise(function (resolve, reject) {
        // Incoming data package has user name (email address) and password
        // { email: xxx, password: yyy }
        Admins.findOne({ email: adminData.email }, (error, item) => {
          if (error) {
            // Query error
            return reject(new Error(`Login - ${error.message}`));
          }
          // Check for an item
          if (item) {
            // Compare password with stored value
            const isPasswordMatch = bcrypt.compareSync(adminData.password, item.password);
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
    }, // adminLogin

    // User Update // debugged
    adminUpdate: function (_id, admin) {
      return new Promise(function (resolve, reject) {
        Admins.findByIdAndUpdate(_id, admin, { new: true }, (error, item) => {
          if (error) {
            // Cannot edit item
            return reject(error.message);
          }
          // Check for an item
          if (item) {
            // Success message will be returned
            return resolve('Admin updated');
          } else {
            return reject(new Error('Not found'));
          }
        });
      });
    },

    //Full User Cart Save
    adminCartSaveFull: function (_id, CourseArray) {
      var wrappedItem = { "finalPrograms": CourseArray };
      return new Promise(function (resolve, reject) {
        Admins.findByIdAndUpdate(_id, wrappedItem, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
          }
        });
      });
    },

    //Temporary User Cart Save
    adminCartSave: function (_id, CourseArray) {
      var wrappedItem = { "tempPrograms": CourseArray };
      return new Promise(function (resolve, reject) {
        Admins.findByIdAndUpdate(_id, wrappedItem, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
          }
        });
      });
    },
    // Users Register
    adminPassReset: function (adminData, newPassword) {
      // Generate a "salt" value
      const salt = bcrypt.genSaltSync(10);
      // Hash the result
      const hash = bcrypt.hashSync(newPassword, salt);
      newPassword = hash;
      var wrappedItem = { "password": newPassword }
      // debugged
      return new Promise(function (resolve, reject) {
        Admins.findOneAndUpdate({ "email": adminData }, wrappedItem, { new: true }, (error, object) => {
          if (error) {
            return reject(error.message);
          }
          if (object) {
            return resolve(object);
          } else {
            return reject('Not found');
          }
        });
      }); // return new Promise
    }, // usersRegister
  };
};
