require('./config/config.js');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const Cryptr = require('cryptr');
const {mongoose} = require('./mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const cryptr = new Cryptr('Education@system@sucks@100%!');
const {User} = require('./model');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.post('/signup', (req, res) => {
  let body = _.pick(req.body, ['fname', 'lname', 'add1', 'add2', 'id', 'password']);
  body.password = cryptr.decrypt(body.password);
  body.id = cryptr.decrypt(body.id);
  const user = new User(body);
  user.save()
    .then(user => {
      return res.send(_.pick(user, ['fname', 'lname', 'id', 'add1', 'add2']));
    })
    .catch(e => {
      return res.status(400).send('Error while saving!');
    })
});

app.post('/login', (req, res) => {
  let body = _.pick(req.body, ['id', 'password']);
  body.password = cryptr.decrypt(body.password);
  body.id = cryptr.decrypt(body.id);

  User.findOne({id: body.id}).then((doc) => {
    bcrypt.compare(body.password, doc.password, (err, r) => {
      if(err) {
        return res.status(400).send('Invalid Password.');
      }
      if(r) {
          return res.send(_.pick(doc, ['fname', 'lname', 'id', 'add1', 'add2']));
      } else {
        return res.status(401).send('Incorect password.');
      }
    })
  }).catch((e) => {
    console.log(e);
    return res.status(400).send('Invalid ID.');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
