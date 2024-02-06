const winston = require('winston');
require('winston-daily-rotate-file');

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});

const errorFileTransport = new winston.transports.File({
  filename: 'error.log',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    consoleTransport,
    fileTransport,
    errorFileTransport
  ],
});

module.exports = logger;
