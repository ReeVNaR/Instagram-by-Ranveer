import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://revsinsta.vercel.app',
    'https://instagram-by-ranveer-0yvp.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Remove all manual CORS headers - we'll let the cors package handle everything
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  displayName: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);

// Add Image Schema after User Schema
const ImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  caption: { type: String, default: '' },
  aspectRatio: { type: String, enum: ['1:1', '4:5', '1.91:1'], default: '1:1' },
}, { timestamps: true });

const Image = mongoose.model("Image", ImageSchema);

// Add after existing schema definitions
const FriendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);

// Add after existing schema definitions
const RecentSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  searchedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const RecentSearch = mongoose.model("RecentSearch", RecentSearchSchema);

// Add Like Schema
const LikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
}, { timestamps: true });

const Like = mongoose.model("Like", LikeSchema);

// Add Message Schema
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: { folder: "uploads", format: async () => "jpg" },
});
const upload = multer({ storage });

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Add isAdmin middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({ error: "Admin access required" });
    }
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

// ✅ User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Set admin status based on email
    user.isAdmin = user.email === process.env.ADMIN_EMAIL;
    await user.save();

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Image Upload to Cloudinary
app.post("/api/upload", auth, upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({
      userId: req.userId,
      url: req.file.path,
      public_id: req.file.filename,
      caption: req.body.caption || '',
      aspectRatio: req.body.aspectRatio || '1:1'
    });
    await newImage.save();
    res.json({ imageUrl: req.file.path, _id: newImage._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Get Images Route
app.get("/api/images", auth, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Get All Images Route (Admin only)
app.get("/api/admin/images", auth, isAdmin, async (req, res) => {
  try {
    const images = await Image.find().populate('userId', 'username email').sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Delete Image Route
app.delete("/api/images/:id", auth, async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, userId: req.userId });
    if (!image) return res.status(404).json({ error: "Image not found" });
    
    await cloudinary.v2.uploader.destroy(image.public_id);
    await Image.deleteOne({ _id: req.params.id });
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Get All Posts Route
app.get("/api/feed", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Get posts from friends and current user
    const posts = await Image.find({
      userId: { $in: [...currentUser.friends, req.userId] }
    })
    .populate('userId', 'username displayName profilePic')
    .sort({ createdAt: -1 });

    const postsWithLikes = await Promise.all(posts.map(async (post) => {
      const likes = await Like.countDocuments({ postId: post._id });
      const isLiked = await Like.findOne({ userId: req.userId, postId: post._id });
      return {
        ...post.toObject(),
        likes,
        isLiked: !!isLiked
      };
    }));

    res.json(postsWithLikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Profile Routes
app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const posts = await Image.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/profile", auth, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { displayName },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint after existing profile routes
app.post("/api/profile/picture", auth, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.profilePic) {
      // Extract public_id from the old profile picture URL
      const publicId = user.profilePic.split('/').slice(-2).join('/').split('.')[0];
      // Delete old profile picture from cloudinary
      await cloudinary.v2.uploader.destroy(publicId);
    }
    
    user.profilePic = req.file.path;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint after existing profile routes
app.put("/api/profile/privacy", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.isPrivate = !user.isPrivate;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Search Users Route
app.get("/api/users/search", auth, async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { displayName: { $regex: searchQuery, $options: 'i' } }
      ]
    }).select('username displayName profilePic');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoints after existing ones
app.post("/api/friend-request/:userId", auth, async (req, res) => {
  try {
    const receiverId = req.params.userId;
    if (req.userId === receiverId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: req.userId,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    const newRequest = new FriendRequest({
      sender: req.userId,
      receiver: receiverId
    });
    await newRequest.save();
    res.json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username displayName profilePic isPrivate');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Image.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    const currentUser = await User.findById(req.userId);
    const isFriend = currentUser.friends.includes(req.params.userId);
    
    // Check for pending friend request
    const friendRequest = await FriendRequest.findOne({
      sender: req.userId,
      receiver: req.params.userId,
      status: 'pending'
    });
    
    // If account is private and user is not friend, don't send posts
    const visiblePosts = user.isPrivate && !isFriend ? [] : posts;

    res.json({ 
      user, 
      posts: visiblePosts, 
      requestSent: !!friendRequest,
      isFriend,
      isPrivate: user.isPrivate
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoints
app.post("/api/recent-searches", auth, async (req, res) => {
  try {
    const { searchedUserId } = req.body;
    await RecentSearch.findOneAndUpdate(
      { userId: req.userId, searchedUserId },
      { userId: req.userId, searchedUserId },
      { upsert: true, new: true }
    );
    res.json({ message: "Search recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/recent-searches", auth, async (req, res) => {
  try {
    const recentSearches = await RecentSearch.find({ userId: req.userId })
      .populate('searchedUserId', 'username displayName profilePic')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(recentSearches.map(search => search.searchedUserId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/recent-searches/:searchedUserId", auth, async (req, res) => {
  try {
    await RecentSearch.deleteOne({
      userId: req.userId,
      searchedUserId: req.params.searchedUserId
    });
    res.json({ message: "Search removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Like endpoints
app.post("/api/posts/:postId/like", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const existingLike = await Like.findOne({ userId: req.userId, postId });
    
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      res.json({ liked: false });
    } else {
      await Like.create({ userId: req.userId, postId });
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint for getting friend requests
app.get("/api/friend-requests", auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ 
      receiver: req.userId,
      status: 'pending'
    })
    .populate('sender', 'username displayName profilePic')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/friend-requests/:requestId", auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (status === 'accepted') {
      // Add users to each other's friends list
      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: request.receiver }
      });
      await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { friends: request.sender }
      });
    }
    
    await FriendRequest.findByIdAndUpdate(req.params.requestId, { status });
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add chat endpoints
app.get("/api/friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username displayName profilePic');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this endpoint before the other message endpoints
app.get("/api/messages/unread/count", auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/messages/:friendId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.friendId },
        { sender: req.params.friendId, receiver: req.userId }
      ]
    })
    .populate('sender', 'username')
    .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.friendId, receiver: req.userId },
      { read: true }
    );
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages/:friendId", auth, async (req, res) => {
  try {
    const newMessage = new Message({
      sender: req.userId,
      receiver: req.params.friendId,
      content: req.body.content
    });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username');
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint for unread messages count
app.get("/api/messages/unread", auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add near other message endpoints
app.get("/api/messages/:friendId/last", auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      $or: [
        { sender: req.userId, receiver: req.params.friendId },
        { sender: req.params.friendId, receiver: req.userId }
      ]
    })
    .populate('sender', 'username')
    .sort({ createdAt: -1 });
    
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add near other message endpoints
app.get("/api/messages/:friendId/unread/count", auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      sender: req.params.friendId,
      receiver: req.userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move API health check before main route handling
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple route handler for all non-API routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.json({ message: 'Backend API is running' });
});

// Error handler should be last
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const serverPort = 5000;
app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
