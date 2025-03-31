import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',  // Nível mínimo de log a ser capturado
  transports: [
    // Log no console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),  // Adiciona cores ao log no console
        winston.format.simple()     // Formato simples para log no console
      ),
    }),
    // Log em um arquivo
    new winston.transports.File({ filename: '../logs/app.log' })
  ],
});

module.exports = logger;