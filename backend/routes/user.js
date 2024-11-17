// backend/routes/user.js
const { z } = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const express = require("express");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const userBody = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    if (!userBody.safeParse(body).success) {
      return res.status(400).json({ msg: "Incorrect inputs" });
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ msg: "Email already taken" });
    }

    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    await Account.create({
      userId: user._id,
      balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ msg: "User successfully created", token });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

const signinBody = z.object({
  username: z.string().email(),
  password: z.string(),
});

router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    if (!signinBody.safeParse(body).success) {
      return res.status(400).json({ msg: "Incorrect inputs" });
    }

    const user = await User.findOne({
      username: req.body.username,
      password: req.body.password,
    });

    if (user) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ msg: "Error while logging in" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

const updateBody = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    if (!updateBody.safeParse(body).success) {
      return res.status(400).json({ msg: "Error while updating information" });
    }

    await User.updateOne({ _id: req.userId }, body);
    res.json({ msg: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.get("/bulk", async (req, res) => {
  try {
    const filter = req.query.filter || "";
    const users = await User.find({
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    });

    res.json({
      users: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
