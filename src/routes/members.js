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
  Member.find().exec((err, members) => {
    if (err) res.status(400).json({ errors: parseErrors(err.errors) })
    res.json(members.map((member) => member.toAuthJSON()));
  })
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

// food chart
router.post("/chart", (req, res) => {

  const value = req.body.data;
  console.log(value, 'fo')
  try {
    Member.findOneAndUpdate({ phone: value.phone }, { $push: { food_chart: value } }).then((member) => {
      res.json(member)
      console.log('fook', member)
    })
  } catch (e) {
    console.log('fook', member)
    res.status(500).json(e)
  }
});

router.delete("/chart", (req, res) => {

  const value = req.body;
  console.log("delete route", value)
  try {
    Member.findOneAndUpdate({ phone: value.phone, }, { $pull: { food_chart: { _id: value._id } } }).then((member) => {
      res.json(member)
    })
  } catch (e) {
    res.status(500).json(e)
  }
});
///end of food chart

/// attendance
router.post("/attendance", (req, res) => {
  /*
  data = {
    attendance: {
      [{
        date: new Date(),
        entry: date,
        exit: date
      },
        {
          date: new Date(),
          entry: date,
          exit: date
        }]
    }
  }
  find user whose phone is $phone,
    now check if on attendance field for date of today,
      if its found,
        check if entry is empty,
          then update entry with current time,
        else
          update exit with current time.


  */
  const value = req.body.data;

  // {phone,date,time: entry/exit}

  try {
    Member.findOne({ phone: value.phone }).then((member) => {


      // let na = member.filter((e)=> )
      const dates = {
        convert: function (d) {
          return (
            d.constructor === Date ? d :
              d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                d.constructor === Number ? new Date(d) :
                  d.constructor === String ? new Date(d) :
                    typeof d === "object" ? new Date(d.year, d.month, d.date) :
                      NaN
          );
        },
        inRange: function (d, start, end) {
          return (
            isFinite(d = this.convert(d).valueOf()) &&
              isFinite(start = this.convert(start).valueOf()) &&
              isFinite(end = this.convert(end).valueOf()) ?
              start <= d && d <= end :
              NaN
          );
        }
      }

      var start = new Date();
      start.setHours(0, 0, 0, 0);

      var end = new Date();
      end.setHours(23, 59, 59, 999);

      let isToday = member.attendance.filter(e => {
        if (dates.inRange(e.date, start, end)) {
          return e
        }
      })

      let todaysDate;

      if (isToday.length > 0) {

        todaysDate = member.attendance.map(e => {

          if (dates.inRange(e.date, start, end)) {

            if (value.time == "entry") {
              console.log("i'm in")
              e.entry = new Date();
            } else {
              e.exit = new Date();
            }
            return e
          }

        })
        member.attendance = todaysDate
      } else {

        if (value.time == "entry") {
          member.attendance.push({ date: new Date(), entry: new Date() })
        }
      }


      member.save()
      res.json(member.attendance)
    })
  } catch (e) {
    console.log('fook', member)
    res.status(500).json(e)
  }
});
//end of attendance
router.post("/:phone", (req, res) => {

  const value = req.params.phone;
  Member.findOne({ phone: value }).exec((err, member) => {
    if (err) res.status(400).json({ errors: parseErrors(err.errors) })
    res.json(member.toAuthJSON())

  })
});


export default router;
