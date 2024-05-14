const { db } = require("../../utils/db");
const { validationResult } = require("express-validator");
const { checkPassword } = require("../../utils/password.util");
const { createJwtToken } = require("../../utils/token.util");
const cookie = require("cookie");
const { NODE_ENV } = require("../../config/env.config");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
exports.login = async (req, res, next) => {
  // return api fields validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: 422,
      message: "User input error",
      data: errors.mapped(),
    });
  }
  const { email, password, platform, coords } = req.body;

  try {
    // verify email
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next({ status: 400, message: "Incorrect email address" });
    }
    // verify password
    const matchPassword = await checkPassword(password, user.password);
    if (!matchPassword) {
      return next({ status: 400, message: "Incorrect password" });
    }

    const token = createJwtToken({ userId: user.id });

    // set token to user frontend cookies
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        sameSite: NODE_ENV === "production" ? "none" : "strict",
        maxAge: 3600 * 12,
        path: "/",
        secure: NODE_ENV === "production" ? true : false,
      })
    );

    const { name, version, layout, description, ua, os } = platform;

    await db.loginHistory.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isCurrent: false,
      },
    });
    const currentAccount = await db.loginHistory.create({
      data: {
        browser: {
          name,
          description,
          version,
          ua,
          layout,
        },

        os,
        location: {
          ...coords,
        },
        token,
        userId: user.id,
        isActive: true,
        isCurrent: true,
      },
    });

    const currentUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: "ACTIVE",
      },
    });

    delete currentUser.password;

    res.status(201).json({
      type: "success",
      message: "You have loggedin successfully",
      data: {
        user: currentUser,
        token,
        currentAccount,
      },
    });
  } catch (error) {
    next(error);
  }
  
};
passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: `${config.HOST}/auth/google/callback`
},
  async function (accessToken, refreshToken, profile, cb) {
      try {
          let userInfo = await User.find({ email: profile._json.email })
          let token;
          if (!userInfo || userInfo.length === 0) {
              // If user not found, create a new user
              const saltRounds = parseInt(config.SALT_KEY);
              const salt = await bcrypt.genSalt(saltRounds);
              const hashedPassword = await bcrypt.hash(config.JWT_SECRET, salt);
              const newUser = new User({
                  email: profile._json.email,
                  password: hashedPassword,
                  imageUrl: profile._json.picture,
                  name: profile._json.name
              });
              userInfo = await newUser.save();
          }
          token = await generateAndSaveToken(userInfo[0]);

          // Callback with user data and token
          return cb(null, { user: userInfo, token: token });
      } catch (err) {
          console.error('Error in Google authentication:', err);
          return cb(err);
      }
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

/**
* Initiates Google authentication.
* 
* @param {Object} req - The request object.
* @param {Object} res - The response object.
*/
async function googleLogin(req, res) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
}

/**
* Handles Google authentication callback.
* 
* @param {Object} req - The request object.
* @param {Object} res - The response object.
*/
async function googleCallBack(req, res) {
  passport.authenticate('google', { failureRedirect: '/login' })(req, res, async function (err, data) {
      if (err) {
          console.error('Error in Google authentication callback:', err);
          return res.status(500).json({ message: 'Internal server error.' });
      }
      // Successful authentication, send back user data and JWT token
      res.json({ token: req.user.token });
  });
}

module.exports = { googleLogin, googleCallBack };