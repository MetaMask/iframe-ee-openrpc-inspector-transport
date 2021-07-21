import IframeInspectorTransportPlugin from './IframeInspectorTransportPlugin';

const iframeInspectorTransportPlugin = new IframeInspectorTransportPlugin();
window.addEventListener('message', iframeInspectorTransportPlugin.onMessage);
