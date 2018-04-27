import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";
import moment from 'moment';
// TODO: add uniqueness and email validations to email field
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true
    },
    name: {
      type: String,
      // required: true,
    },
    gender: String,
    phone: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    dob: Date,
    address: String,
    extranote: String,
    package: { package_month: { type: Number, required: true }, package_name: { type: String, required: true } },
    trainer: { trainer_name: { type: String, required: true }, trainer_number: { type: String, required: true } },
    joiningdate: Date,
    workout_items: [{
      day: String,
      name: String,
      link: String
    }],
    food_chart: [{
      name: String,
      time: String
    }],
    attendance: [{
      date: Date,
      entry: Date,
      exit: Date
    }],
    // passwordHash: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: "" }
  },
  { timestamps: true }
);


schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
};

schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
};

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
};

schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  return `${
    process.env.HOST
    }/reset_password/${this.generateResetPasswordToken()}`;
};

schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      confirmed: this.confirmed
    },
    process.env.JWT_SECRET
  );
};

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    address: this.address,
    dob: moment(this.dob, "YYYYMMDD").format("MMM Do YYYY"),
    gender: this.gender,
    email: this.email,
    expiringdate: moment(this.joiningdate, "YYYYMMDD").add(this.package.package_month, 'months').fromNow(),
    extranote: this.extranote,
    joiningdate: moment(this.joiningdate, "YYYYMMDD").format("MMM Do YYYY"),
    name: this.name,
    package: this.package,
    phone: this.phone,
    trainer: this.trainer,
    workout_items: this.workout_items,
    food_chart: this.food_chart,
    attendance: this.attendance
  };
};


schema.plugin(uniqueValidator, {
  message: "It is already taken, try another one."
});

export default mongoose.model("Member", schema);
