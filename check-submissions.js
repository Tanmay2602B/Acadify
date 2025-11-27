// Quick script to check submissions in database
require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('./models/Resource.mongo');

async function checkSubmissions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find the specific assignment
        const assignmentId = '69275a19951f3db9ffeb4676';
        const resource = await Resource.findById(assignmentId);
        
        if (!resource) {
            console.log('❌ Assignment not found');
            return;
        }
        
        console.log('\n📋 Assignment:', resource.title);
        console.log('📊 Total submissions:', resource.submissions?.length || 0);
        
        if (resource.submissions && resource.submissions.length > 0) {
            console.log('\n👥 Submissions:');
            resource.submissions.forEach((sub, idx) => {
                console.log(`\n${idx + 1}. Student: ${sub.student_name} (${sub.student_id})`);
                console.log(`   File: ${sub.file_url}`);
                console.log(`   Submitted: ${sub.submitted_at}`);
                console.log(`   Status: ${sub.status}`);
                console.log(`   Comments: ${sub.comments || 'None'}`);
            });
        } else {
            console.log('\n⚠️ NO SUBMISSIONS FOUND');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSubmissions();
