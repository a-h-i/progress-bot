import { default as winston } from 'winston';


const transports = [
    
];

if (process.env.NODE_ENV === 'development') {
    transports.push(new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.prettyPrint()
        ),
        handleExceptions: true
    }));
    transports.push(new winston.transports.File({
        level: 'debug',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.prettyPrint()
        ),
        filename: 'logs/statera_dev_logs.json',
        options: { flags: 'w' }
    }));
}

if (process.env.NODE_ENV === 'test') {
    transports.push(new winston.transports.File(
        {
            filename: 'logs/statera_tests_logs.json',
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.prettyPrint()
            ),
            options: { flags: 'w' }
        }
    ));
}

if (process.env.NODE_ENV === 'production') {
    transports.push(new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json()
        ),
        stderrLevels: [ 'emerg', 'alert', 'crit', 'error' ]
    }));
}

/**
 * Available logging levels RFC5424
 * emerg
 * alert
 * crit
 * error
 * warning
 * notice
 * info
 * debug
 */
const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    transports: transports,
    level: 'debug'
});



export { logger };