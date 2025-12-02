import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


/*⭐ BILKUL THEEK samjha tune — yahan par teri line ko correct form me likh raha hoon:

✔ “Jab main payload deta hoon sign() me, wo payload + secret key se ek signature banata hai.
✔ Jab next request me token aata hai, wo token ke andar ka data nikalta hai,
✔ same payload + same secret key se phir signature banata hai,
✔ dono signatures compare karta hai,
✔ aur match ho gaya to user ko aage jaane deta hai.”

YEHI EXACT FLOW HAI. 💯💯💯 */