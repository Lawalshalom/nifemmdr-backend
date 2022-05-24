const router = require("express").Router();
const jwt = require("jsonwebtoken");
const uuid = require("uuidv4").uuid;

const POSTS = require("../models/Posts");

router.post("/new", verifyToken, (req, res) => {
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) return res.status(201).json({ error: err.message, err });
		if (authData) {
			const newPost = new POSTS({
				...req.body,
			});
			newPost.save().then((post) => {
				if (post) return res.status(201).json({ success: true, post });
			});
		}
	});
});

router.get("/all", (req, res) => {
	POSTS.find({}, (err, posts) => {
		if (err) return res.status(200).json({ error: err.message, err });
		if (posts) return res.status(200).json({ success: true, posts });
	});
});

router.post("/edit", verifyToken, (req, res) => {
	const { _id } = req.body;
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) {
			res.status(403).json({ error: "Unathorized, Please login again", err });
		} else {
			POSTS.findOneAndUpdate(
				{ _id },
				{ header: req.body.header, posts: req.body.posts },
				(err, post) => {
					if (err) return res.status(200).json({ error: err.message, err });
					if (post) return res.status(200).json({ success: true, post });

					// if (post) {
					// 	const newPost = { ...post, ...req.body };
					// 	newPost.save().then((err, post) => {
					// 		if (err) return res.status(200).json({ error: err.message, err });
					// 		if (post) return res.status(200).json({ success: true, post });
					// 	});
					// }
				}
			);
		}
	});
});

router.post("/delete", verifyToken, (req, res) => {
	const { id } = req.body;
	jwt.verify(req.token, "secretonesharekey", (err, authData) => {
		if (err) {
			res.status(403).json({ error: "Unathorized, Please login again", err });
		} else {
			POSTS.findOne({ _id: id }, (err, post) => {
				if (err) return res.status(200).json({ error: err.message, err });
				if (post) {
					post.remove().then((post) => {
						if (post) return res.status(200).json({ success: true, post });
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
