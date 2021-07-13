import openrpcDocument from './openrpc.json';
import methodMapping from './methods/methodMapping';

window.addEventListener('message', async (event: MessageEvent) => {
  if (!event.data.jsonrpc) {
    return;
  }

  const eventSource: Window = event.source as Window;

  if (event.data.method === 'rpc.discover') {
    eventSource.postMessage(
      {
        jsonrpc: '2.0',
        result: openrpcDocument,
        id: event.data.id,
      },
      event.origin,
    );
    return;
  }

  if (!methodMapping[event.data.method]) {
    eventSource.postMessage(
      {
        jsonrpc: '2.0',
        error: {
          code: 32009,
          message: 'Method not found',
        },
        id: event.data.id,
      },
      event.origin,
    );
    return;
  }
  methodMapping[event.data.method](...event.data.params, event.origin)
    .then((results: unknown) => {
      eventSource.postMessage(
        {
          jsonrpc: '2.0',
          result: results,
          id: event.data.id,
        },
        event.origin,
      );
    })
    .catch((e: Error) => {
      eventSource.postMessage(
        {
          jsonrpc: '2.0',
          error: {
            code: 32329,
            message: e.message,
          },
          id: event.data.id,
        },
        event.origin,
      );
    });
});
