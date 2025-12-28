require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('--- Cloudinary Configuration Check ---');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? `"${process.env.CLOUDINARY_CLOUD_NAME}"` : 'UNDEFINED');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'UNDEFINED');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'UNDEFINED');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\nAttempting to verify connection...');

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Connection Failed!');
        console.error('Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Connection Successful!');
        console.log('Result:', result);
    }
});
