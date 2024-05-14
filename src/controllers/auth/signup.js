const { validationResult } = require("express-validator");
const { hashPassword } = require("../../utils/password.util");
const { db } = require("../../utils/db");
const passport = require('passport');
const { generateRandomImage } = require("../../utils/generateImage");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

exports.signup = async (req, res, next) => {
    // return api fields level error validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({
        status: 422,
        message: "User input error",
        data: errors.mapped(),
      });
    }
    let { email, password, firstName, lastName, bio, phone, isPublic  } = req.body;
    try {
      // check duplicate email
      const emailExist = await db.user.findUnique({
        where: {
          email,
        },
        select: {
          email: true,
        },
      });
  
      if (emailExist) {
        return next({ status: 400, message: "Email address already exists" });
      }
  
      // hash password
  
      password = await hashPassword(password);
  
      // create new user
  
      const user = await db.user.create({
        data: {
          firstName,
          lastName,
          email,
          password,
          bio,
          phone,
          isPublic,
      
          profileImage: generateRandomImage({ str: email }),
          coverImage: generateRandomImage({
            size: 400,
            str: email,
            type: "blank",
          }),
        },
      });
  
      return res.status(201).json({
        type: "success",
        message: `Account created for ${user.firstName}`,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };