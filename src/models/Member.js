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
    phone: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    dob: Date,
    address: String,
    extranote: String,
    package: String,
    trainer: String,
    joiningdate: Date,
    expiringdate: Date,
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
    email: this.email,
    expiringdate: moment(this.expiringdate, "YYYYMMDD").fromNow(),
    extranote: this.extranote,
    joiningdate: moment(this.joiningdate, "YYYYMMDD").format("MMM Do YYYY"),
    name: this.name,
    package: this.package,
    phone: this.phone,
    trainer: this.trainer
  };
};


schema.plugin(uniqueValidator, {
  message: "It is already taken, try another one."
});

export default mongoose.model("Member", schema);
