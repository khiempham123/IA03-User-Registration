const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://phamgiakhiem:KhiemTra0605@cluster0.57jn7dq.mongodb.net/ia03?retryWrites=true&w=majority';

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('ia03');
    console.log('Database "ia03" selected');
    
    // Create collection if not exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('users');
      console.log('✅ Collection "users" created');
    } else {
      console.log('✅ Collection "users" already exists');
    }
    
    // List all databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log(` - ${db.name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

testConnection();
