import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  const refreshToken =
    req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};

export default verifyJWT;
