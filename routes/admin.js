const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const adminUser = require("../models/Admin");

router.post("/new", (req, res) => {
	const { name, email, password, secretKey } = req.body;

	if (!name || !email || !password || !secretKey) {
		return res.status(201).json({ error: "Please fill in all fields" });
	} else {
		adminUser.findOne({ email }, (err, admin) => {
			if (err) return res.status(201).json({ error: err.message, err });

			if (admin) {
				return res
					.status(201)
					.json({ error: "email already registered as admin" });
			} else {
				const user = new adminUser({
					name,
					email,
					password,
					secretKey,
				});
				bcrypt.hash(user.password, 10, (err, hash) => {
					if (err) return res.status(201).json({ error: err.message, err });
					user.password = hash;
					user
						.save()
						.then((savedUser) => {
							res
								.status(201)
								.json({ success: "registration successful", user: savedUser });
						})
						.catch((err) => {
							return res.status(201).json({
								error: err.message,
								err,
							});
						});
				});
			}
		});
	}
});

router.get("/all", verifyToken, (req, res) => {
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) return res.status(201).json({ error: err.message, err });
		if (authData) {
			adminUser.find({}, (err, admins) => {
				if (err) return res.status(201).json({ error: err.message, err });
				if (admins) return res.status(201).json({ admins });
			});
		}
	});
});

router.post("/login", (req, res) => {
	const { email, password } = req.body;
	adminUser.findOne({ email }, (err, user) => {
		if (err) return res.status(201).json({ error: err.message, err });
		if (user) {
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) return res.status(200).json({ error: err.message, err });

				if (isMatch) {
					jwt.sign(
						{ user },
						"secretonesharekey",
						{ expiresIn: "48h" },
						(err, token) => {
							if (err)
								return res.status(200).json({
									error: err.message,
									err,
								});
							return res
								.status(200)
								.json({ success: "Login successful", user, token });
						}
					);
				} else return res.status(200).json({ error: "Password Incorrect" });
			});
		} else
			return res
				.status(200)
				.json({ error: "Email is not registered as admin" });
	});
});

router.post("/edit", verifyToken, (req, res) => {
	const { id } = req.body;
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) {
			res.status(403).json({ error: "Unathorized, Please login again", err });
		} else {
			adminUser.findOne({ id }, (err, admin) => {
				if (err) return res.status(200).json({ error: err.message, err });
				if (admin) {
					const newAdmin = { ...admin, ...req.body };
					newAdmin.save().then((err, admin) => {
						if (err) return res.status(400).json({ error: err.message, err });
						if (admin)
							return res
								.status(200)
								.json({
									message: "Admin deleted successfully",
									success: true,
									admin,
								});
					});
				}
			});
		}
	});
});

router.post("/delete", verifyToken, (req, res) => {
	const { _id } = req.body;
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) {
			res.status(401).json({ error: "Unathorized, Please login again", err });
		} else {
			adminUser.findOne({ id }, (err, admin) => {
				if (err) return res.status(200).json({ error: err.message, err });
				if (admin) {
					admin
						.remove()
						.then((data) =>
							res
								.status(200)
								.json({
									message: "Admin deleted successfully",
									success: true,
									admin: data,
								})
						);
				}
			});
		}
	});
});

router.post("/change-password", verifyToken, (req, res) => {
	const { oldPassword, newPassword } = req.body;
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) {
			res.status(403).json({ error: "Unathorized, Please login again", err });
		} else {
			adminUser.findOne({ email: authData.user.email }, (err, user) => {
				if (err) return res.status(201).json({ error: err.message, err });
				if (user) {
					bcrypt.compare(oldPassword, user.password, (err, result) => {
						if (err)
							return res.status(201).json({
								error: err.message,
								err,
							});
						if (!result) {
							return res.status(201).json({ error: "Incorrect Old Password" });
						} else if (result) {
							bcrypt.hash(newPassword, 10, (err, hash) => {
								if (err)
									return res.status(201).json({
										error: err.message,
										err,
									});
								user.password = hash;
								user
									.save()
									.then((newUser) => {
										return res
											.status(201)
											.json({ success: "Password change successful", newUser });
									})
									.catch((err) => {
										return res.status(201).json({
											error: err.message,
											err,
										});
									});
							});
						}
					});
				}
			});
		}
	});
});

function verifyToken(req, res, next) {
	const bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== "undefined") {
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	} else {
		res.status(403).json({ error: "You do not have access, please login" });
	}
}

module.exports = router;
