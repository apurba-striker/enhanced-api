const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const friendsRoutes = require("./friends.route");
const groupsRoutes = require("./group.route");
const userRoutes = require("./user.route");
const notificationRoutes = require("./notification.route");
const messengerRoutes = require("./messenger.route");
const settingRoutes = require("./settings.route");
const searchRoutes = require("./search.route");
const commentsRoute = require("./comment.route");
const adminRoutes = require("./admin.route");
const cloudinaryRoutes = require("./cloudinary.route")

exports.registerRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/friends", friendsRoutes);
  app.use("/api/groups", groupsRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/messenger", messengerRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/comments", commentsRoute);
  app.use("/api/admin", adminRoutes);
  app.use("/api/cloudinary", cloudinaryRoutes);
};
