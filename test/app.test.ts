import { serverProxy as server } from 'app';
import {
  HealthCheckResponse,
  HealthClient,
  HealthCheckRequest,
} from 'grpc-ts-health-check';
import grpc from 'grpc';

describe('Health check', () => {
  let client: HealthClient;

  beforeAll(() => {
    const port = server.bind(
      '0.0.0.0:0',
      grpc.ServerCredentials.createInsecure()
    );
    server.start();
    client = new HealthClient(
      `localhost:${port}`,
      grpc.credentials.createInsecure()
    );
  });

  afterAll(() => {
    server.forceShutdown();
  });

  test('service should be SERVING', done => {
    const request = new HealthCheckRequest();
    request.setService('');
    client.check(request, (err, response) => {
      expect(err).toBeNull();
      expect(response.getStatus()).toEqual(
        HealthCheckResponse.ServingStatus.SERVING
      );
      done();
    });
  });
});
