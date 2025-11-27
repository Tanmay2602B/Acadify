const mongoose = require('mongoose');
const crypto = require('crypto');

// Simple encryption for credentials (for admin viewing only)
const ENCRYPTION_KEY = process.env.CREDENTIAL_KEY || 'acadify-credential-key-32chars!!';
const IV_LENGTH = 16;

function encrypt(text) {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const credentialSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        ref: 'User'
    },
    role: {
        type: String,
        required: true,
        enum: ['faculty', 'student']
    },
    email: {
        type: String,
        required: true
    },
    password_encrypted: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method to set password (encrypts it)
credentialSchema.methods.setPassword = function(plainPassword) {
    this.password_encrypted = encrypt(plainPassword);
};

// Method to get password (decrypts it)
credentialSchema.methods.getPassword = function() {
    return decrypt(this.password_encrypted);
};

const Credential = mongoose.model('Credential', credentialSchema);

module.exports = Credential;
