import { ClobClient } from '@polymarket/clob-client';
import { UserActivityInterface, UserPositionInterface } from '../interfaces/User';
import { ENV } from '../config/env';
import { getUserActivityModel } from '../models/userHistory';
import fetchData from '../utils/fetchData';
import spinner from '../utils/spinner';
import getMyBalance from '../utils/getMyBalance';
import postOrder from '../utils/postOrder';

const USER_ADDRESS = ENV.USER_ADDRESS;
const RETRY_LIMIT = ENV.RETRY_LIMIT;
const PROXY_WALLET = ENV.PROXY_WALLET;

let temp_trades: UserActivityInterface[] = [];

const UserActivity = getUserActivityModel(USER_ADDRESS);

const readTempTrade = async () => {
    temp_trades = (
        await UserActivity.find({
            $and: [
                { type: 'TRADE' },
                { bot: false },
                {
                    $or: [
                        { botExcutedTime: { $exists: false } },
                        { botExcutedTime: { $lt: RETRY_LIMIT } },
                    ],
                },
            ],
        }).exec()
    ).map((trade: any) => trade as UserActivityInterface);
};

const doTrading = async (clobClient: ClobClient) => {
    for (const trade of temp_trades) {
        try {
            console.log('Trade to copy:', trade);
            
            const my_positions_raw = await fetchData(
                `https://data-api.polymarket.com/positions?user=${PROXY_WALLET}`
            );
            const user_positions_raw = await fetchData(
                `https://data-api.polymarket.com/positions?user=${USER_ADDRESS}`
            );
            
            const my_positions: UserPositionInterface[] = Array.isArray(my_positions_raw) 
                ? my_positions_raw 
                : [];
            const user_positions: UserPositionInterface[] = Array.isArray(user_positions_raw) 
                ? user_positions_raw 
                : [];
            
            const my_position = my_positions.find(
                (position: UserPositionInterface) => position.conditionId === trade.conditionId
            );
            const user_position = user_positions.find(
                (position: UserPositionInterface) => position.conditionId === trade.conditionId
            );
            
            const my_balance = await getMyBalance(PROXY_WALLET);
            const user_balance = await getMyBalance(USER_ADDRESS);
            
            console.log('My current balance:', my_balance);
            console.log('User current balance:', user_balance);
            console.log('My position:', my_position);
            console.log('User position:', user_position);
            
            let condition: string;
            
            if (trade.side === 'BUY') {
                condition = 'buy';
            } else if (trade.side === 'SELL') {
                condition = 'sell';
            } else {
                if (my_position && !user_position) {
                    condition = 'merge';
                } else if (trade.side === 'MERGE') {
                    condition = 'merge';
                } else {
                    condition = trade.side.toLowerCase();
                }
            }
            
            console.log(`Determined condition: ${condition} for trade ${trade.transactionHash}`);
            
            await postOrder(
                clobClient,
                condition,
                my_position,
                user_position,
                trade,
                my_balance,
                user_balance
            );
            
            console.log(`Completed processing trade: ${trade.transactionHash}`);
        } catch (error) {
            console.error(`Error processing trade ${trade.transactionHash}:`, error);
            await UserActivity.updateOne(
                { _id: trade._id },
                { bot: true, botExcutedTime: RETRY_LIMIT }
            );
        }
    }
};

const tradeExcutor = async (clobClient: ClobClient) => {
    console.log(`Executing Arbitrage CopyTrading`);

    while (true) {
        await readTempTrade();
        if (temp_trades.length > 0) {
            console.log(` ${temp_trades.length} new transaction(s) found`);
            spinner.stop();
            await doTrading(clobClient);
        } else {
            spinner.start('scanning for transactions');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

export default tradeExcutor;
