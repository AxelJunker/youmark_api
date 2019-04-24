const log4js = require('log4js');

let logger;

if (process.env.NODE_ENV === 'production') {
  console.log('IN PRODUCTION');
  log4js.configure({
    appenders: {
      aws: {
        type: 'log4js-cloudwatch-appender',
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
        region: 'us-east-2',
        logGroup: 'youmark',
        logStream: 'youmark_stream',
        layout: {
          type: 'pattern',
          pattern: '%d%n %p%n %m',
        },
      },
    },
    categories: {
      default: { appenders: ['aws'], level: 'info' },
    },
  });

  logger = log4js.getLogger('aws');
} else {
  log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: 'info' } },
  });

  logger = log4js.getLogger('console');
}

module.exports = logger;
