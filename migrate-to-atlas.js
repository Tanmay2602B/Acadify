const mongoose = require('mongoose');
require('dotenv').config();

// Local MongoDB URI (Source)
const LOCAL_URI = 'mongodb://localhost:27017/acadify';
// Atlas MongoDB URI (Destination)
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Models - we need to define schemas to read/write data
// We'll use the existing models but we need to be careful about connections
const userSchema = new mongoose.Schema({}, { strict: false });
const studentSchema = new mongoose.Schema({}, { strict: false });
const facultySchema = new mongoose.Schema({}, { strict: false });
const courseSchema = new mongoose.Schema({}, { strict: false });
// ... generic schema for all collections since we just want to copy data

async function migrate() {
    console.log('🚀 Starting migration...');
    console.log(`📍 Source: ${LOCAL_URI}`);
    console.log(`📍 Destination: Atlas`);

    // 1. Connect to Local DB
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local DB');

    // 2. Connect to Atlas DB
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to Atlas DB');

    try {
        // Get list of collections from local
        const collections = await localConn.db.listCollections().toArray();

        for (const collectionInfo of collections) {
            const collName = collectionInfo.name;
            if (collName === 'system.indexes') continue;

            console.log(`\n📦 Migrating collection: ${collName}`);

            // Read from Local
            const LocalModel = localConn.model(collName, userSchema, collName);
            const docs = await LocalModel.find({});
            console.log(`   Found ${docs.length} documents in local`);

            if (docs.length === 0) continue;

            // Write to Atlas
            const AtlasModel = atlasConn.model(collName, userSchema, collName);

            // Optional: Clear Atlas collection first to avoid duplicates
            await AtlasModel.deleteMany({});
            console.log(`   Cleared existing data in Atlas for ${collName}`);

            if (docs.length > 0) {
                await AtlasModel.insertMany(docs);
                console.log(`   ✅ Inserted ${docs.length} documents into Atlas`);
            }
        }

        console.log('\n✨ Migration completed successfully!');
        console.log('You can now connect to Atlas using Compass with your new URI to verify the data.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await localConn.close();
        await atlasConn.close();
        process.exit(0);
    }
}

migrate();
