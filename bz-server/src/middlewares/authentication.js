import jwt from "jsonwebtoken";

const userAuthentication = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  const jwtToken = authHeader.split(" ")[1];
  // console.log(jwtToken);

  jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, (error, payload) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(405)
          .json({ success: false, message: "Token has expired" });
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // console.log(payload);
    req.userId = payload.userId;
    return next();
  });
};

export { userAuthentication };
