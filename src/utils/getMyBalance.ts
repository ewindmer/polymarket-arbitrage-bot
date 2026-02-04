import { ethers } from 'ethers';
import { ENV } from '../config/env';

const RPC_URL = ENV.RPC_URL;
const USDC_CONTRACT_ADDRESS = ENV.USDC_CONTRACT_ADDRESS;

const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

const getMyBalance = async (address: string): Promise<number> => {
    try {
        const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, rpcProvider);
        const balance_usdc = await usdcContract.balanceOf(address);
        const balance_usdc_real = ethers.utils.formatUnits(balance_usdc, 6);
        return parseFloat(balance_usdc_real);
    } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error);
        // Return 0 as fallback to prevent crashes
        return 0;
    }
};

export default getMyBalance;
