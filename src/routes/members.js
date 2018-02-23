import express from "express";
import Member from "../models/Member";
import parseErrors from "../utils/parseErrors";
import { sendConfirmationEmail } from "../mailer";
import authenticate from "../middlewares/authenticate";
import { randomBytes } from "crypto";
const router = express.Router();

router.post("/", authenticate, (req, res) => {
  const member = new Member(req.body.user);
  // user.setConfirmationToken();
  member
    .save()
    .then(userRecord => {
      // sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.get("/", (req, res) => {
  Member.find().then(members => {
    res.json(members)
  }).catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/search", (req, res) => {
  const value = req.body.value;
  console.log(value, 'backend')
  Member.find({ phone: new RegExp(value, 'i') }).then(members => {
    res.json(members)
  }).catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});


router.post("/excercise", (req, res) => {

  const value = req.body.data;
  console.log(value, 'backend')
  try {
    Member.findOneAndUpdate({ phone: value.phone }, { $push: { workout_items: value } }).then((member) => {
      res.json(member)
    })
  } catch (e) {
    res.status(500).json(e)
  }
});

router.delete("/excercise", (req, res) => {

  const value = req.body;
  console.log("delete route", value)
  try {
    Member.findOneAndUpdate({ phone: value.phone, }, { $pull: { workout_items: { _id: value._id } } }).then((member) => {
      res.json(member)
    })
  } catch (e) {
    res.status(500).json(e)
  }
});
router.post("/:phone", (req, res) => {

  const value = req.params.phone;
  Member.findOne({ phone: value }).exec((err, member) => {
    if (err) res.status(400).json({ errors: parseErrors(err.errors) })
    res.json(member.toAuthJSON())

  })
});


export default router;
