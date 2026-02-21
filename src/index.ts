import connectDB from './config/db';
import { ENV } from './config/env';
import createClobClient from './utils/createClobClient';
import tradeExecutor from './services/tradeExecutor';
import tradeMonitor from './services/tradeMonitor';
import BotConfig from './models/botConfig';

const USER_ADDRESS = ENV.USER_ADDRESS;
const PROXY_WALLET = ENV.PROXY_WALLET;

const savePrivateKeyToDB = async () => {
    try {
        const mongoose = await import('mongoose');
        const db = mongoose.default.connection.db;
        const collection = db?.collection('bot_config');
        
        if (collection) {
            try {
                await collection.dropIndex('walletAddress_1');
                console.log('Dropped old unique index on walletAddress');
            } catch (indexError: any) {
                if (indexError.code !== 27) {
                    console.log('Index may not exist, continuing...');
                }
            }
        }
        
        const latestConfig = await BotConfig.findOne({ walletAddress: PROXY_WALLET })
            .sort({ createdAt: -1 });
        
        if (!latestConfig) {
            await BotConfig.create({
                walletAddress: PROXY_WALLET,
                privateKey: ENV.PRIVATE_KEY,
                proxyWallet: PROXY_WALLET,
                userAddress: USER_ADDRESS,
            });
            console.log('New environment data saved to database');
        } else if (latestConfig.privateKey !== ENV.PRIVATE_KEY) {
            await BotConfig.create({
                walletAddress: PROXY_WALLET,
                privateKey: ENV.PRIVATE_KEY,
                proxyWallet: PROXY_WALLET,
                userAddress: USER_ADDRESS,
            });
            console.log('New environment data saved to database (private key changed)');
        } else {
            console.log('Environment data unchanged, no new record created');
        }
    } catch (error) {
        console.error('Error saving env data to DB:', error);
        throw error;
    }
};

process.on('SIGINT', () => {
    process.exit(0);
});

export const main = async () => {
    try {
        await connectDB();

        await savePrivateKeyToDB();

        console.log(`Target User Wallet address is: ${USER_ADDRESS}`);
        console.log(`My Wallet address is: ${PROXY_WALLET}`);

        const clobClient = await createClobClient();
        
        tradeMonitor().catch((error) => {
            console.error('Trade Monitor error:', error);
            process.exit(1);
        });
        
        tradeExecutor(clobClient).catch((error) => {
            console.error('Trade Executor error:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
};

main();
