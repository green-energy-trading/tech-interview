/* eslint-disable testing-library/await-async-query */
import {SignatureRequest, SignatureService} from './challenge';

describe('SignatureRequests', () => {
  test('findByDocumentId', () => {
    const requests = new SignatureService([
      new SignatureRequest('anyId', 'anyDocId'),
      new SignatureRequest('anotherId', 'anotherDocId')
    ]);

    expect(requests.findById('anyId')).toMatchInlineSnapshot(`
      SignatureRequest {
        "documentId": "anyDocId",
        "id": "anyId",
        "requiredSignatures": Array [],
        "signatures": Array [],
      }
    `);
  });

  test('findAllByDocumentId', () => {
    const requests = new SignatureService([
      new SignatureRequest('anyId', 'anyDocId'),
      new SignatureRequest('anotherId', 'anotherDocId')
    ]);

    expect(requests.findAllByDocumentId('anotherDocId')).toHaveLength(1)
  })
});
