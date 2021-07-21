# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1]
### Added
- Added github pages release
- refactor index.ts to IframeInspectorTransportPlugin
- Changed methodMapping to be a factory and only instantiate 1 IframeExecutionEnvironmentTransport
- Changed package.json to better reflect module template
- eth-rpc-errors lib to have better error codes
- add timeout to handle if window never gets created
- Initial OpenRPC Inspector Transport implementation

[Unreleased]: https://github.com/MetaMask/iframe-ee-openrpc-inspector-transport/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/MetaMask/iframe-ee-openrpc-inspector-transport/releases/tag/v0.0.1
