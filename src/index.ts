import grpc from 'grpc';
import { serverProxy } from 'app';
import { logger } from '@green-energy-trading/logger-package';
import { config, configToString, validateConfig } from 'config';

validateConfig();

logger.info('Starting server');
logger.info(configToString());

serverProxy.bind(
  `0.0.0.0:${config.port}`,
  grpc.ServerCredentials.createInsecure()
);
serverProxy.start();
