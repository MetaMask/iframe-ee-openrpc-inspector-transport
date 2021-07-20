import { ethErrors, serializeError } from 'eth-rpc-errors';
import openrpcDocument from './openrpc.json';
import methodMappingFactory from './methods/methodMapping';
import IframeExecutionEnvironmentTransport from './transports/IframeExecutionEnvironmentTransport';

const methodMapping = methodMappingFactory(
  new IframeExecutionEnvironmentTransport(),
);

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
        error: ethErrors.rpc.methodNotFound({
          message: `${event.data.method} not found`,
        }),
        id: event.data.id,
      },
      event.origin,
    );
    return;
  }
  try {
    const results = await methodMapping[event.data.method](
      ...event.data.params,
    );
    eventSource.postMessage(
      {
        jsonrpc: '2.0',
        result: results,
        id: event.data.id,
      },
      event.origin,
    );
  } catch (e) {
    eventSource.postMessage(
      {
        jsonrpc: '2.0',
        error: serializeError(e, { shouldIncludeStack: true }),
        id: event.data.id,
      },
      event.origin,
    );
  }
});
