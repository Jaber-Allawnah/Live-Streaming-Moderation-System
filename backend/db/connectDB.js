import mongoose from 'mongoose'

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "Live_stream_chat" });
        console.log('Connected successfully.');
    } catch (error) {
        console.log("Error connecting to MongoDB" , error.message);
    }
}

export default connectMongoDB;