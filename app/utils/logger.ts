import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const EMAIL_API_LOG = path.join(LOG_DIR, 'email-api.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

export function logEmailAPI(type: 'INFO' | 'ERROR', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        message,
        data: data ? JSON.stringify(data, null, 2) : undefined
    };

    const logString = `${JSON.stringify(logEntry)}\n`;
    
    // Append to log file
    fs.appendFileSync(EMAIL_API_LOG, logString);
} 