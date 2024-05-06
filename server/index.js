const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://veepthyofficial:C92cbX1xdWX4OqNt@chatmasala.y1st1bl.mongodb.net/?retryWrites=true&w=majority&appName=chatmasala', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
  uid: String,
  text: {
    type: String,
    required: true,
  },
  name: String,
  pic: {
    type:String,
    default:""
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const profileSchema = new mongoose.Schema({
  uid: String,
  name: String,
  bio: String,
  pic: {
    type:String,
    default:""
  },
  state: {
    type: Boolean,
    default: false
  }
});


const Message = mongoose.model('Message', messageSchema);
const Profile = mongoose.model('Profile', profileSchema);


app.use(bodyParser.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//endpoint to save each user
app.post('/api/userOn', async (req, res) => {
  const { uid } = req.body;
  // console.log('on ' + uid);
  try {
    const user = await Profile.findOne({ uid: uid });
    if (!user) {
      await Profile.create({ uid: uid, name:"",bio:"",pic:"", state: true }); // Changed 'active' to 'state'
    } else {
      user.state = true; // Changed 'active' to 'state'
      await user.save();
    }
    res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/userOff', async (req, res) => {
  const { uid } = req.body;
  // console.log('off ' + uid)
  try {
    const user = await Profile.findOne({ uid: uid });
    if (user) {
      if (user.state === true) { 
        user.state = false;
        await user.save();
      }
    } else {
      console.log('user not found');
    }
    res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//get all users
app.get("/api/users",async(req,res)=>{
  const users = await Profile.find();
  try{
    if(users){
      res.json(users);
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to save user profile details into profile db
app.post('/api/text', upload.none(), async (req, res) => {
  const { uid, name, pic, text } = req.body;
  try {
    const message = await new Message({ uid, name, pic, text }).save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Profile.findOne({ uid: id });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/profile', upload.single('pic'), async (req, res) => {
  const { uid, name, bio } = req.body;
  let pic = '';
  if (req.file) {
      pic = req.file.buffer.toString('base64');
  }

  try {
      let user = await Profile.findOne({ uid: uid });
      if (user) {
          user.name = name;
          user.bio = bio;
          user.pic = pic;
          await user.save();
      } else {
          user = await new Profile({ uid: uid, name: name, bio: bio, pic: pic }).save();
      }
      res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
      console.error('Internal Server Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to get all images from MongoDB
app.get('/api/text', async (req, res) => {
  try {
    const chat = await Message.find();
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
