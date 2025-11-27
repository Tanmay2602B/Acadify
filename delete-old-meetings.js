const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Import Meeting model
    const Meeting = require('./models/Meeting.mongo');
    
    // Find all meetings using meet.jit.si
    const oldMeetings = await Meeting.find({
      jitsi_room_url: { $regex: 'meet.jit.si' }
    });
    
    console.log(`\nFound ${oldMeetings.length} meetings using meet.jit.si domain`);
    
    if (oldMeetings.length > 0) {
      console.log('\nMeetings to be deleted:');
      oldMeetings.forEach((meeting, index) => {
        console.log(`${index + 1}. ${meeting.title} (${meeting.meeting_id})`);
        console.log(`   URL: ${meeting.jitsi_room_url}`);
        console.log(`   Faculty: ${meeting.faculty_name}`);
        console.log(`   Date: ${meeting.scheduled_time}`);
        console.log('');
      });
      
      // Delete old meetings
      const result = await Meeting.deleteMany({
        jitsi_room_url: { $regex: 'meet.jit.si' }
      });
      
      console.log(`✅ Successfully deleted ${result.deletedCount} old meetings`);
      console.log('\n📝 Note: Please create new meetings. They will use 8x8.vc domain.');
    } else {
      console.log('✅ No old meetings found. All meetings are using the new domain!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
});
