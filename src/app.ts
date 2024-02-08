import grpc from 'grpc';
import { serverInterceptor as awsXrayServerInterceptor } from 'grpc-aws-xray-interceptors';
import interceptors from '@pionerlabs/grpc-interceptors';
import AWSXRay from 'aws-xray-sdk';
import { logger } from '@green-energy-trading/logger-package';
import { config } from 'config';
import {
  GrpcHealthCheck,
  HealthCheckResponse,
  HealthService,
} from 'grpc-ts-health-check';

const server = new grpc.Server();

const healthCheckStatusMap = {
  '': HealthCheckResponse.ServingStatus.SERVING,
};

const grpcHealthCheck = new GrpcHealthCheck(healthCheckStatusMap);
server.addService(HealthService, grpcHealthCheck);

export const serverProxy = interceptors.serverProxy(server);

// Set up AWS X-Ray
AWSXRay.setLogger(logger);
serverProxy.use(awsXrayServerInterceptor(config.serviceName));
