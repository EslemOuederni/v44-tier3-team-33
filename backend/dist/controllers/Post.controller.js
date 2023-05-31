"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.addPostToFavorites = exports.updatePostStatus = exports.updatePost = exports.createPost = exports.getPostsByPrice = exports.getPostsByGenre = exports.getSoldPostsByUserId = exports.getAvailablePostByUser = exports.getAvailablePostsByUserId = exports.getAvailablePosts = exports.getPostsByUserId = exports.getPostById = exports.getAllPosts = void 0;
const Post_model_1 = require("../models/Post.model");
const Genre_model_1 = require("../models/Genre.model");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils/utils");
//get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = (await Post_model_1.Post.find());
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        console.log(posts);
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getAllPosts = getAllPosts;
//get post by id
const getPostById = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await Post_model_1.Post.findById(id);
        if (!post?.createdBy || !post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const user = await clerk_sdk_node_1.users.getUser(post.createdBy);
        const postWithUser = {
            post,
            userInfo: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.emailAddresses[0].emailAddress,
                profileImageUrl: user.profileImageUrl,
                publicMetadata: user.publicMetadata,
            },
        };
        res.status(200).json({ data: postWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getPostById = getPostById;
// get posts by user id
const getPostsByUserId = async (req, res) => {
    const id = req.params.id;
    try {
        const posts = (await Post_model_1.Post.find({ createdBy: id }));
        if (!posts) {
            return res.status(404).json({ message: "Post not found" });
        }
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getPostsByUserId = getPostsByUserId;
// get posts that are available and populate user
const getAvailablePosts = async (req, res) => {
    try {
        const posts = (await Post_model_1.Post.find({ status: "available" }));
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        console.log(postsWithUser);
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getAvailablePosts = getAvailablePosts;
// get posts available by user id
const getAvailablePostsByUserId = async (req, res) => {
    const id = req.params.id;
    try {
        const posts = await Post_model_1.Post.find({ createdBy: id, status: "available" }).limit(3);
        const postsWithUser = await Promise.all(posts.map(async (post) => {
            const user = await clerk_sdk_node_1.users.getUser(post.createdBy);
            return {
                post: post,
                userInfo: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.emailAddresses[0].emailAddress,
                    profileImageUrl: user.profileImageUrl,
                    publicMetadata: user.publicMetadata,
                },
            };
        }));
        console.log(postsWithUser);
        res.status(200).json(postsWithUser);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getAvailablePostsByUserId = getAvailablePostsByUserId;
// get Available post by user
const getAvailablePostByUser = async (req, res) => {
    const id = req.params.id;
    try {
        const post = (await Post_model_1.Post.findOne({
            _id: id,
            status: "available",
        }));
        const postWithUser = await (0, utils_1.getPostWithUser)({ post: post });
        res.status(200).json(postWithUser);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getAvailablePostByUser = getAvailablePostByUser;
// get posts sold by user id
const getSoldPostsByUserId = async (req, res) => {
    const id = req.params.id;
    try {
        const posts = (await Post_model_1.Post.find({
            createdBy: id,
            status: "sold",
        }));
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getSoldPostsByUserId = getSoldPostsByUserId;
// get posts by genre
const getPostsByGenre = async (req, res) => {
    // this might change to req.body
    const id = req.params.id;
    console.log(id);
    try {
        const posts = (await Post_model_1.Post.find({
            genres: id,
            status: "available",
        }));
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getPostsByGenre = getPostsByGenre;
// get available posts where price is less than or equal to
const getPostsByPrice = async (req, res) => {
    const price = req.params.price;
    try {
        const posts = (await Post_model_1.Post.find({
            price: { $lte: price },
            status: "available",
        }));
        const postsWithUser = await (0, utils_1.getPostsWithUser)({ posts: posts });
        res.status(200).json({ data: postsWithUser });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getPostsByPrice = getPostsByPrice;
//create post
const createPost = async (req, res) => {
    const { body: { post }, } = req;
    console.log(req.auth.userId);
    if (!req.auth.userId || !req.auth) {
        return res.status(401).json({ message: "this user is not authed" });
    }
    const user = await clerk_sdk_node_1.users.getUser(req.auth.userId);
    if (!user.id) {
        return res.status(401).json({ message: "this user is not authed" });
    }
    // find genre by id
    const postGenres = await Promise.all(post.genre.map(async (genre) => {
        const genreNew = await Genre_model_1.Genre.findOne({ genreName: genre });
        if (genreNew)
            return genreNew._id;
        const createdGenre = await Genre_model_1.Genre.create({ genreName: genre });
        return createdGenre._id;
    }));
    try {
        const newPost = await Post_model_1.Post.create({
            createdBy: user.id,
            genres: postGenres,
            imgs: post.imagesURLs,
            ...post,
        });
        console.log(newPost);
        //if user has no public metadata, create it
        if (!user.publicMetadata.posts) {
            console.log("no public metadata");
            await clerk_sdk_node_1.users.updateUser(user.id, {
                publicMetadata: {
                    posts: [newPost._id.toString()],
                },
            });
            res.status(200).json(newPost);
        }
        else {
            // if user has public metadata, add post to it
            // define public metadata posts
            const posts = user.publicMetadata.posts;
            // add post to user metadata
            posts.push(newPost._id.toString());
            // update user metadata
            await clerk_sdk_node_1.users.updateUser(user.id, {
                publicMetadata: {
                    posts: posts,
                },
            });
            console.log(user.publicMetadata.posts);
        }
        return res.status(200).json(newPost);
    }
    catch (error) {
        return res.status(409).json({ message: error });
    }
};
exports.createPost = createPost;
// update post general info
const updatePost = async (req, res) => {
    const id = req.params.id;
    const { image, author, title, genres, isbn, condition, price } = req.body;
    try {
        const updatedPost = await Post_model_1.Post.findByIdAndUpdate(id, {
            image,
            author,
            title,
            genres,
            isbn,
            condition,
            price,
        }, { new: true });
        res.status(200).json(updatedPost);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.updatePost = updatePost;
// update post status (available or sold)
const updatePostStatus = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    try {
        const updatedPost = await Post_model_1.Post.findByIdAndUpdate(id, {
            status,
        }, { new: true });
        res.status(200).json(updatedPost);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.updatePostStatus = updatePostStatus;
// add post to user's Favorites
const addPostToFavorites = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    const user = await clerk_sdk_node_1.users.getUser(userId);
    try {
        // check if post exists
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(404).send(`No post with id: ${id}`);
        // check if favourites private metadata exists
        if (!user.privateMetadata.favourites) {
            await clerk_sdk_node_1.users.updateUser(userId, {
                privateMetadata: {
                    favourites: [id.toString()],
                },
            });
            return res.status(200).json({ message: "Post added to favourites" });
        }
        else {
            const favourites = user.privateMetadata.favourites;
            favourites.push(id.toString());
            await clerk_sdk_node_1.users.updateUser(userId, {
                privateMetadata: {
                    favourites: favourites,
                },
            });
            return res.status(200).json({ message: "Post added to favourites" });
        }
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.addPostToFavorites = addPostToFavorites;
// delete post
const deletePost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await Post_model_1.Post.findById(id);
        // remove post from genre
        await Genre_model_1.Genre.updateOne({ _id: post?.genres }, { $pull: { posts: post?._id } });
        await Post_model_1.Post.findByIdAndDelete(id);
        // remove post from user metadata
        const user = await clerk_sdk_node_1.users.getUser(post?.createdBy);
        const posts = user.publicMetadata.posts;
        const index = posts.indexOf(id);
        if (index > -1) {
            posts.splice(index, 1);
        }
        await clerk_sdk_node_1.users.updateUser(user.id, {
            publicMetadata: {
                posts: posts,
            },
        });
        return res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=Post.controller.js.map