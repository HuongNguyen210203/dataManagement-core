// userModel.js
let users = [];

module.exports = {
  createUser: (username, hashedPassword) => {
    const user = { id: users.length + 1, username, password: hashedPassword };
    users.push(user);
    return user;
  },
  findUserByUsername: (username) => {
    return users.find(user => user.username === username);
  },
  findUserById: (id) => {
    return users.find(user => user.id === id);
  },
  findAllUsers: () => {
    return users.map(user => ({ id: user.id, username: user.username })); // hide passwords
  }
};

