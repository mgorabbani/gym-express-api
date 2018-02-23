import express from "express";
import User from "../models/User";
import parseErrors from "../utils/parseErrors";
import { sendConfirmationEmail } from "../mailer";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password, username, gym_name } = req.body.user;
  const user = new User({ email, username, gym_name });
  user.setPassword(password);
  user.setConfirmationToken();
  user
    .save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/add_package", authenticate, (req, res) => {
  // const { email, password, username, gym_name } = req.body.user;
  User.findOne({ email: req.currentUser.email }).then(user => {
    user.package_list.push(req.body.data)
    user.save((err, todo) => {
      if (err) {
        res.status(500).json({ errors: err })
      }
      res.status(200).json({ success: "OK" })
    });

  }).catch(e => res.status(401)({ errors: e }))


})
router.post("/add_trainer", authenticate, (req, res) => {
  // const { email, password, username, gym_name } = req.body.user;
  User.findOne({ email: req.currentUser.email }).then(user => {
    user.trainer_list.push(req.body.data)
    user.save((err, todo) => {
      if (err) {
        res.status(500).json({ errors: 'Something went wrong!' })
      }

      res.status(200).json({ success: "OK" })
    });

  }).catch(e => res.status(401)({ errors: e }))


})
router.post("/delete_trainer", authenticate, (req, res) => {
  // const { email, password, username, gym_name } = req.body.user;
  console.log(req.body.id);
  User.findOne({ email: req.currentUser.email }).then(user => {
    user.trainer_list.id(req.body.id).remove()
    user.save((err) => {
      if (err) {
        res.status(500).json({ errors: 'Something went wrong!' })
      }
      res.status(200).json({ success: "OK" })
    });

  }).catch(e => res.status(401)({ errors: "Something isn't right" }))
})
router.post("/delete_package", authenticate, (req, res) => {
  // const { email, password, username, gym_name } = req.body.user;
  console.log(req.body.id);
  User.findOne({ email: req.currentUser.email }).then(user => {
    user.package_list.id(req.body.id).remove()
    user.save((err) => {
      if (err) {
        res.status(500).json({ errors: err })
      }
      res.status(200).json({ success: "OK" })
    });

  }).catch(e => res.status(401)({ errors: "Something isn't right" }))
})
router.get("/current_user", authenticate, (req, res) => {
  if (!req.currentUser.email) res.status(401).json({ errors: 'no user found' })
  res.json({
    user: {
      email: req.currentUser.email,
      confirmed: req.currentUser.confirmed,
      username: req.currentUser.username,
      gym_name: req.currentUser.gym_name,
      package_list: req.currentUser.package_list,
      trainer_list: req.currentUser.trainer_list,
    }
  });
});

export default router;
