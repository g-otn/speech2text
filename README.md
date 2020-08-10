# speech2text
Speech to text POC/test app made with React Native made mainly to test Google Cloud Speech-to-Text API.

## Setting up and Running

### Google Cloud
You will need a Google Cloud Project with Speech-to-Text API enabled and an API key to use it.
1. [Create a Google Cloud Project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#console)
2. [Enable Speech-To-Text API](https://console.cloud.google.com/apis/library/speech.googleapis.com)
3. [Create an API key](https://console.cloud.google.com/apis/credentials)

### Running the project
Requirements: [React Native CLI environment](https://reactnative.dev/docs/environment-setup)

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
- Simple backend (or Google Cloud Function / AWS Lambda) to receive and convert audio
