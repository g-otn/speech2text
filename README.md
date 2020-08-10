# speech2text
Speech to text POC/test app made with React Native made mainly to test Google Cloud Speech-to-Text API.

## Running
Requirements: [React Native CLI environment](https://reactnative.dev/docs/environment-setup#native)

1. Clone and navigate to the project:
```bash
git clone https://github.com/g-otn/speech2text.git && cd speech2text/
```

2. Install dependencies:
```bash
npm i
```

3. Start the dev server
```
npm start
```

4. In another terminal, build and run the project in a connected device or emulator:
```
npm run android
```

## TODO
Since this is just a test project, TODO may be put in very, very low priority
- Automatic upload and management to/of Google Cloud Storage for audio with >=1min duration
- Simple backend (or AWS Lambda) to recieve conversion requests and call ffmpeg
