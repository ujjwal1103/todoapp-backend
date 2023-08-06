const mongoose = require('mongoose');

// Define the Conversation schema
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }
}, { timestamps: true });




// Create and export the Conversation model
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
