import { ClobClient, OrderType, Side } from '@polymarket/clob-client';
import { ENV } from '../config/env';
import getMyBalance from '../utils/getMyBalance';

const USER_ADDRESS = ENV.USER_ADDRESS;
const PROXY_WALLET = ENV.PROXY_WALLET;

const test = async (clobClient: ClobClient) => {
   
    const price = (
        await clobClient.getLastTradePrice(
            '7335630785946116680591336507965313288831710468958917901279210617913444658937'
        )
        
    ).price;
    console.log(price);
    const signedOrder = await clobClient.createOrder({
        side: Side.BUY,
        tokenID: '7335630785946116680591336507965313288831710468958917901279210617913444658937',
        size: 5,
        price,
    });
    const resp = await clobClient.postOrder(signedOrder, OrderType.GTC);
    console.log(resp);
};

export default test;
