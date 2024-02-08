import convict from 'convict';

const schema = {
  nodeEnv: {
    doc: 'Node environment',
    format: ['production', 'development', 'test', 'demo'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'Port the server is listening on',
    format: 'port',
    default: 50051,
    env: 'PORT',
  },
  serviceName: {
    doc: 'Name of this service',
    format: String,
    default: null,
    env: 'SERVICE_NAME',
  },
};

const convictConfig = convict(schema);

export const config = {
  nodeEnv: convictConfig.get('nodeEnv'),
  port: convictConfig.get('port'),
  serviceName: convictConfig.get('serviceName') || '',
};

export const validateConfig = () => {
  return convictConfig.validate({ allowed: 'strict' });
};

export const configToString = () => {
  return convictConfig.toString();
};
