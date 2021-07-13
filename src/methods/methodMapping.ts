import { Close, Connect, SendData } from '../__GENERATED_TYPES__';
import IframeExecutionEnvironmentTransport from '../transports/IframeExecutionEnvironmentTransport';

export interface IMethodMapping {
  [methodName: string]: (...params: any[]) => Promise<unknown>;
}

let transport: IframeExecutionEnvironmentTransport | undefined;

const connect: Connect = async (uri: string) => {
  transport = new IframeExecutionEnvironmentTransport(uri);
  return transport.connect();
};

const sendData: SendData = (data) => {
  if (!transport) {
    throw new Error('Not Connected');
  }
  return transport.sendData({
    internalID: data.id,
    request: data,
  });
};

const close: Close = async () => {
  transport?.close();
};

const methodMapping: IMethodMapping = {
  connect,
  sendData,
  close,
};

export default methodMapping;
