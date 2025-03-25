import express from 'express';
import fs from 'fs';
import pth from 'path';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const app = express();
const logDir = pth.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logC = ((req, res, next) => {
    const date = new Date();
    const logEntry = `${date.toISOString()} - ${req.method} - ${req.path} - ${req.ip} - ${req.action}\n`;

    const logFilePath = pth.join(logDir, 'api.log');

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.log('Erro ao gravar o log:', err);
        }
    });
});


const log = ((req, res, next) => {
    const date = new Date();
    const logEntry = `${date.toISOString()} - ${req.method} - ${req.path} - ${req.ip} - ${req.user.id}\n`;

    const logFilePath = pth.join(logDir, 'api.log');

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.log('Erro ao gravar o log:', err);
        }
    });

    next();
});

export default { log, logC }; 