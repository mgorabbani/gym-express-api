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
    console.log(members)
    res.json(members)
  }).catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});
export default router;
