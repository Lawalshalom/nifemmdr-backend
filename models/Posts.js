const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	header: {
		type: String,
		required: true,
	},
	posts: {
		type: [mongoose.Schema.Types.Mixed],
		required: true,
	},
	page: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("posts", postSchema);
