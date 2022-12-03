const userhelpers = require("../helpers/userHelper");

// const config = require("../config/twolio");
// const clients = require("twilio")(config.accountSID, config.authToken);

require('dotenv').config()
// twilio client setup
const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOCKEN);

module.exports = {
  loginGet: (req, res) => {
    if (req.session.userLogin) {
      req.session.active = true;
      res.redirect("/");
    } else {
      res.render("userSide/login", { error: req.session.error });
      req.session.error = false;
    }
  },

  loginPost: (req, res) => {
    userhelpers.dologin(req.body).then((response) => {
      if (response.status) {
        req.session.userLogin = true;
        req.session.user = response.user;
        const redirect = req.session.returnUrl || "/";
        delete req.session.returnUrl;
        res.redirect(redirect);
      } else if (response.ban) {
        req.session.error = "Sorry ! You cant access ";
        res.redirect("/login");
      } else {
        req.session.error = "Oops! wrong Password or Email";
        res.redirect("/login");
      }
    });
  },

  signupGet: (req, res) => {
    res.render("userSide/signup", {
      error: req.session.usedEmail || req.session.invalidReferal,
    });
    req.session.usedEmail = false;
  },

  signupPost: (req, res) => {
    userhelpers
      .dosignup(req.body)
      .then((response) => {
        if (response.email) {
          req.session.usedEmail = "Acount is already exist";
          res.redirect("/signup");
        } else {
          res.redirect("/login");
        }
      })
      .catch(() => {
        req.session.invalidReferal = "Referal code is Invalid";
      });
  },

  mobilePage: (req, res) => {
    res.render("userSide/mobile", { error: req.session.invalidNumber });
    req.session.invalidNumber = false;
  },

  otpValidation: (req, res) => {
    res.render("userSide/otpValidation");
  },

  otpValidPost: (req, res) => {
    userhelpers.otp(req.body.mobilenumber).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        client.verify
          .services(process.env.SERVICEID)
          .verifications.create({
            to: `+91${req.body.mobilenumber}`,
            channel: "sms",
          })
          .then((data) => {
            req.session.mobilenumber = data.to;
            res.redirect("/otpValid");
          });
      } else {
        req.session.invalidNumber = "Number is not Registered";
        res.redirect("/otpLogin");
      }
    });
  },

  otpCodeChecking: (req, res) => {
    res.render("userSide/otpValidation", {
      phone: req.session.phone,
      otp: req.session.otpfail,
    });
    req.session.otpfail = false;
  },

  otpResend: (req, res) => {
    client.verify
      .services(process.env.SERVICEID)
      .verifications.create({
        to: req.session.mobilenumber,
        channel: "sms",
      })
      .then((data) => {
        console.log("sucess");
      });
  },

  otpPostVerification: (req, res) => {
    var arr = Object.values(req.body);
    var otp = arr.toString().replace(/\,/, "");

    client.verify
      .services(process.env.SERVICEID)
      .verificationChecks.create({
        to: req.session.mobilenumber,
        code: otp,
      })
      .then((data) => {
        if (data.valid) {
          req.session.userLogin = true;
          // req.session.user = response.user;
          res.redirect("/");
        } else {
          req.session.otpfail = "wrong";
          res.redirect("/otp");
        }
      });
  },

  logout: (req, res) => {
    req.session.userLogin = null;
    req.session.user = null;
    req.session.active = false;
    res.redirect("/");
  },
};
