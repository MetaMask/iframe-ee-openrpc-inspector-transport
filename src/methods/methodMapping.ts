import { Close, Connect, SendData } from '../__GENERATED_TYPES__';
import IframeExecutionEnvironmentTransport from '../transports/IframeExecutionEnvironmentTransport';

export interface MethodMapping {
  [methodName: string]: (...params: any[]) => Promise<unknown>;
}

const methodMappingFactory = (
  transport: IframeExecutionEnvironmentTransport,
) => {
  const connect: Connect = async (uri: string) => {
    return transport.connectWithUri(uri);
  };

  const sendData: SendData = (data) => {
    return transport.sendData({
      internalID: data.id,
      request: data,
    });
  };

  const close: Close = async () => {
    transport.close();
  };

  const methodMapping: MethodMapping = {
    connect,
    sendData,
    close,
  };

  return methodMapping;
};

export default methodMappingFactory;
