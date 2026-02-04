import { ENV } from '../config/env';
import { UserActivityInterface, UserPositionInterface } from '../interfaces/User';
import { getUserActivityModel, getUserPositionModel } from '../models/userHistory';
import fetchData from '../utils/fetchData';

const USER_ADDRESS = ENV.USER_ADDRESS;
const TOO_OLD_TIMESTAMP = ENV.TOO_OLD_TIMESTAMP;
const FETCH_INTERVAL = ENV.FETCH_INTERVAL;

if (!USER_ADDRESS) {
    throw new Error('USER_ADDRESS is not defined');
    console.log('USER_ADDRESS is not defined');
}

const UserActivity = getUserActivityModel(USER_ADDRESS);
const UserPosition = getUserPositionModel(USER_ADDRESS);

let temp_trades: UserActivityInterface[] = [];

const init = async () => {
    const trades = await UserActivity.find().exec();
    temp_trades = trades.map((trade) => trade as UserActivityInterface);
    console.log('temp_trades', temp_trades);
};

const fetchTradeData = async () => {
    try {
        // Fetch user activities from Polymarket API
        const activities_raw = await fetchData(
            `https://data-api.polymarket.com/activities?user=${USER_ADDRESS}`
        );

        // Validate API response is an array
        if (!Array.isArray(activities_raw)) {
            if (activities_raw === null || activities_raw === undefined) {
                // Network error or empty response - already handled by fetchData
                return;
            }
            console.warn('API returned non-array response, skipping...');
            return;
        }
        
        if (activities_raw.length === 0) {
            return;
        }
        
        const activities: UserActivityInterface[] = activities_raw;

        const trades = activities.filter((activity) => activity.type === 'TRADE');

        const existingDocs = await UserActivity.find({}, { transactionHash: 1 }).exec();
        const existingHashes = new Set(
            existingDocs
                .map((doc: { transactionHash?: string | null }) => doc.transactionHash)
                .filter((hash): hash is string => Boolean(hash))
        );

        const cutoffTimestamp = Date.now() - TOO_OLD_TIMESTAMP * 60 * 60 * 1000;

        const newTrades = trades.filter((trade: UserActivityInterface) => {
            const isNew = !existingHashes.has(trade.transactionHash);
            const isRecent = trade.timestamp >= cutoffTimestamp;
            return isNew && isRecent;
        });

        if (newTrades.length > 0) {
            console.log(`Found ${newTrades.length} new trade(s) to process`);
            
            // Save new trades to 
            for (const trade of newTrades) {
                const activityData = {
                    ...trade,
                    proxyWallet: USER_ADDRESS,
                    bot: false,
                    botExcutedTime: 0,
                };
                await UserActivity.create(activityData);
                console.log(`Saved new trade: ${trade.transactionHash}`);
            }
        }
    } catch (error) {
        console.error('Error fetching trade data:', error);
    }
};

const tradeMonitor = async () => {
    console.log('Trade Monitor is running every', FETCH_INTERVAL, 'seconds');
    await init();    //Load my oders before sever downs
    while (true) {
        await fetchTradeData();     //Fetch all user activities
        await new Promise((resolve) => setTimeout(resolve, FETCH_INTERVAL * 1000));     //Fetch user activities every second
    }
};

export default tradeMonitor;
