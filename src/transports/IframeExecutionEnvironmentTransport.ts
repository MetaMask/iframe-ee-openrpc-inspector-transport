import { Duplex } from 'stream';
import { Transport } from '@open-rpc/client-js/build/transports/Transport';
import { IJSONRPCData } from '@open-rpc/client-js/build/Request';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';

class IframeExecutionEnvironmentTransport extends Transport {
  private uri?: string;

  private stream?: WindowPostMessageStream;

  private commandStream?: Duplex;

  private frame?: Window;

  private postMessageID: string;

  constructor() {
    super();
    this.postMessageID = `post-message-transport-${Math.random()}`;
  }

  public createWindow(uri: string, timeout = 60000): Promise<Window> {
    const iframe = document.createElement('iframe');
    return new Promise((resolve, reject) => {
      const errorTimeout = setTimeout(() => {
        this.close();
        reject(new Error(`Timed out creating iframe window: ${uri}`));
      }, timeout);
      iframe.addEventListener('load', () => {
        if (iframe.contentWindow) {
          clearTimeout(errorTimeout);
          resolve(iframe.contentWindow);
        }
      });
      document.body.appendChild(iframe);
      iframe.setAttribute('src', uri);
      iframe.setAttribute('id', this.postMessageID);
    });
  }

  public async connectWithUri(uri: string): Promise<boolean> {
    this.uri = uri;
    this.close();
    return this.connect();
  }

  public async connect(): Promise<boolean> {
    if (!this.uri) {
      throw new Error(
        'IframeExecutionEnvironmentTransport Error: no uri to connect to',
      );
    }
    this.frame = await this.createWindow(this.uri);
    this.stream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: this.frame,
    });

    const mux = this.setupMultiplex(this.stream, 'TransportStream');

    this.commandStream = mux.createStream('command') as unknown as Duplex;

    this.commandStream.on('data', (data: unknown) => {
      this.transportRequestManager.resolveResponse(JSON.stringify(data));
    });
    this.transportRequestManager.transportEventChannel.addListener(
      'notification',
      this.notificationHandler,
    );
    this.transportRequestManager.transportEventChannel.addListener(
      'error',
      this.errorNotificationHandler.bind(this),
    );
    return true;
  }

  private errorNotificationHandler(error: Error) {
    this.notificationHandler({
      id: null,
      error: {
        code: error.code,
        message: error.message,
        data: error.data,
      },
    });
  }

  private notificationHandler = (event: any) => {
    window.parent.postMessage(event, '*');
  };

  public async sendData(
    data: IJSONRPCData,
    timeout: number | undefined = 5000,
  ): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, timeout);
    this.commandStream?.write(data.request);
    return prom;
  }

  public close(): void {
    this.transportRequestManager.transportEventChannel.removeAllListeners();
    this.commandStream?.end();
    document.getElementById(this.postMessageID)?.remove();
  }

  private setupMultiplex(stream: WindowPostMessageStream, streamName: string) {
    const mux = new ObjectMultiplex();
    const duplexStream = stream as unknown as Duplex;
    pump(duplexStream, mux as unknown as Duplex, duplexStream, (err) => {
      if (err) {
        console.error(`${streamName} stream failure.`, err);
      }
    });
    return mux;
  }
}

export default IframeExecutionEnvironmentTransport;
