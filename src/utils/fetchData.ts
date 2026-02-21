import axios from 'axios';

const fetchData = async (url: string, retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            return response.data;
        } catch (error: any) {
            if (attempt === retries) {
                console.error(`Failed to fetch data after ${retries} attempts:`, error.message || error);
                return [];
            }
            
            const errorCode = error?.code;
            if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED' || 
                errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND') {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 1.5;
            } else {
                return [];
            }
        }
    }
    return [];
};

export default fetchData;
