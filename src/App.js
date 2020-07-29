import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Switch,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-community/picker';

import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DocumentPicker from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { Recorder, Player } from '@react-native-community/audio-toolkit';

export default class App extends Component {
  player;
  recorder;
  
  isAndroid = Platform.OS === 'android'
  languagesPickerItems = require('./data/languages.json').map(l => (<Picker.Item key={l.bcp47} label={l.name} value={l.bcp47} />));

  constructor(props) {
    super(props);

    this.state = {
      // Recorder
      isRecording: false, // MediaStates.RECORDING
      recorderBusy: false, // from MediaStates.PREPARING to MediaStates.RECORDING
      // currentTime: undefined,
      fileName: undefined,     // File name
      fileFullPath: undefined, // Current full path of recording file

      // File Metadata
      format: this.isAndroid ? 'amr' : 'm4a',

      // File options
      convertInServer: true,

      // Main Options
      languageCode: 'pt-BR',
      profanityFilter: true,
      wordTimeOffset: false,
      wordConfidence: false,
      automaticPunctuation: false,
      model: 'default',
      enhancedModel: false,
    }
  }

  
  getAvailableFormats() {
    let availableFormats = []

    if (this.state.convertInServer) {
      availableFormats.push(
        { value: 'mp4', label: 'm4a' },
        { value: 'aac', label: 'aac' },
      )
      if (this.isAndroid) {
        availableFormats.push(
          { value: 'ogg', label: 'ogg' },
          { value: 'webm', label: 'webm' },
          { value: 'amr', label: 'amr' },
        )
      }
    } else if (this.isAndroid) {
      availableFormats.push(
        { value: 'amr', label: 'amr' },
      )
    } // iOS must convert in server, no accepted formats by the API available in Recorder to be direcly sent

    return availableFormats;
  }

  getFileExtension() {
    return this.getAvailableFormats().filter(f => f.value === this.state.format)[0].label;
  }


  async requestWriteStoragePermission() {
    if (!this.isAndroid) return RESULTS.UNAVAILABLE;
    return await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  }

  async requestReadStoragePermission() {
    if (!this.isAndroid) return RESULTS.UNAVAILABLE;
    return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  }

  async requestMicrophonePermission() {
    return await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        ios: PERMISSIONS.IOS.MICROPHONE,
      })
    );
  }


  async selectFile() { // Android only
    // Request permission to select file
    const permission = await this.requestReadStoragePermission();
    if (permission !== RESULTS.GRANTED) {
      return;
    }

    // Select file
    let fileMetadata = {};
    try {
      fileMetadata = await DocumentPicker.pick({
        // type: [DocumentPicker.types.audio],
        type: ['audio/AMR', 'audio/*'],
      });
    } catch (err) {
      console.error(err)
      return;
    }

    this.setState({ format: 'amr' })
    Alert.alert('File', JSON.stringify(fileMetadata, null, '\t\t'))
  }

  async toggleVoiceRecording() {
    if (this.state.recorderBusy) return;

    this.setState({ recorderBusy: true });
    if (!this.state.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
    this.setState({ recorderBusy: false });
  }

  async startRecording() {
    // Request permissions to use mic and write audio file
    const microphonePermission = await this.requestMicrophonePermission();
    const writeStoragePermission = await this.requestWriteStoragePermission();
    if (microphonePermission !== RESULTS.GRANTED || (this.isAndroid && writeStoragePermission !== RESULTS.GRANTED)) {
      return;
    }

    // Generate file names and prepare Recorder
    const fileName = `S2T_${new Date().toISOString().replace(/[-:]/g, '').replace(/[T\.]/g, '_').slice(0, -5)}.${this.getFileExtension()}`;
    const fileRelativePath = `${fileName}`; // Relative to app 'personal' folder
    console.info('Recording file relative path:', fileRelativePath);
    try {
      await new Promise((resolve, reject) => {

        this.recorder = new Recorder(fileRelativePath, { // Parent folders must exist
          bitrate: 256000,
          channels: 2,
          format: this.state.format,
          sampleRate: this.state.format === 'amr' ? 8000 : 44100,
          meteringInterval: 1000
        }).prepare((err, fsPath) => {
          if (err) throw err;
          console.log('Prepared to record at:', fsPath);
          this.setState({ fileName, fileFullPath: fsPath });
          resolve();
        });

      });
    } catch (err) {
      console.error('Error preparing Recorder:', err);
      Alert.alert('Error while preparing to record', err);
      return;
    }

    // Set meter event handler to update counter
    // this.setState({ currentTime: 0 });
    // this.recorder.on('meter', data => { // Event not firing for some reason
    //   console.log(data);
    //   this.setState({ currentTime: this.state.currentTime + 1 });
    // });

    // Start recording
    this.setState({ isRecording: true });
    try {
      await new Promise((resolve, reject) => {
        
        this.recorder.record(err => {
          if (err) throw err;
          console.info('Recording started');
          resolve();
        });

      });
    } catch (err) {
      console.error('Error while recording:', err);
      Alert.alert('Error while recording', err);
      this.setState({ isRecording: false });
      return;
    }
  }

  async stopRecording() {
    // Stop recording
    try {
      await new Promise((resolve, reject) => {

        this.recorder.stop(err => {
          if (err) throw err;
          console.info('Recording stopped');
          resolve();
        });

      });
    } catch (err) {
      console.error('Error while stopping to record:', err);
      Alert.alert('Error while stopping to record', err);
      this.setState({ isRecording: false });
      return;
    }

    // Copy file to external directory
    if (this.isAndroid) {
      try {
        const recordingsExternalFolderPath = `${RNFS.ExternalStorageDirectoryPath}/Speech2Text`;
        await RNFS.mkdir(recordingsExternalFolderPath); // Create directory if it doesn't exist yet
  
        // Move file to acessible external folder
        const fileExternalFullPath = `${recordingsExternalFolderPath}/${this.state.fileName}`;
        console.info('Moving file\n from:', this.state.fileFullPath, '\n to:', fileExternalFullPath);
        await RNFS.moveFile(this.state.fileFullPath, fileExternalFullPath);
        Alert.alert('Recording saved', `Audio file saved at "${fileExternalFullPath.replace(RNFS.ExternalStorageDirectoryPath + '/', '')}".\n\nYou can now send the audio to be converted to text`);
      } catch (err) {
        console.error('Error while moving temp file:', err);
        Alert.alert('Error while moving file', err);
      }
    }
    this.setState({ isRecording: false });
  }

  // https://stackoverflow.com/a/61335543/11138267
  secondsToTime(e){
    var h = Math.floor(e / 3600).toString().padStart(2,'0'),
        m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(e % 60).toString().padStart(2,'0');
    return h + ':' + m + ':' + s;
  }


  render() {
    return (
      <>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View>


              <View style={styles.card}>
                <Text style={styles.heading}>Speech audio</Text>

                <Text style={{ fontSize: 20 }}>Source</Text>
                <View style={styles.sourceView}>
                  { this.isAndroid ? (
                    <View style={styles.sourceButtonContainer}>
                      <Icon.Button name='file-audio-o' backgroundColor='#e5ffff' style={styles.sourceButton} color='black' onPress={this.selectFile.bind(this)}>
                        <Text style={styles.buttonText}>Select file</Text>
                      </Icon.Button>
                    </View>
                  ) : null }
                  <View style={styles.sourceButtonContainer}>
                    <Icon.Button name={this.state.isRecording ? 'stop' : 'microphone'} 
                      backgroundColor={this.state.isRecording || this.state.recorderBusy ? '#d9534f' : '#e5ffff'} 
                      color={this.state.isRecording ? 'white' : 'black'} 
                      onPress={this.toggleVoiceRecording.bind(this)} 
                      disabled={this.state.recorderBusy}>
                      <Text style={this.state.isRecording || this.state.recorderBusy ? styles.buttonTextRed : styles.buttonText}>
                        {this.state.isRecording ? 'Stop recording' : 'Record voice'}
                      </Text>
                    </Icon.Button>
                  </View>
                </View>

                <View style={styles.sourceView}>

                </View>

                <Text style={styles.sectionTitle}>File metadata</Text>
                <View style={styles.optionsView}>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Name</Text>
                  <Text numberOfLines={2} style={{ flex: 2, fontSize: 14 }}>{(this.state.fileName || '').replace(RNFS.ExternalStorageDirectoryPath + '/', '')}</Text>
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Format <Text style={{ fontSize: 12 }}>(See&nbsp;
                        <Text style={styles.link} onPress={() => Linking.openURL('https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#audioencoding')}>module</Text>,&nbsp;
                        <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/react-native-community/react-native-audio-toolkit/blob/v2.0.3/docs/API.md#recorder-methods')}>API</Text>)
                      </Text>
                    </Text>
                    {/* google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding
                        https://cloud.google.com/speech-to-text/docs/encoding#audio-encodings */}
                    <Picker style={[styles.picker, { flex: 0, minWidth: 110 }]} 
                      onValueChange={format => this.setState({ format })} selectedValue={this.state.format} mode={"dropdown"}>
                      {
                        this.getAvailableFormats().map(f => (
                          <Picker.Item value={f.value} label={f.label} key={f.value} />
                        ))
                      }
                    </Picker>
                  </View>
                </View>

              </View>


              <View style={styles.card}>
                <View style={{ alignSelf: 'flex-start' }}>
                  <Text style={[styles.heading, styles.link]} onPress={() => Linking.openURL('https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig')} >
                    Options
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Main options</Text>
                <View style={styles.optionsView}>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Language</Text>
                    <Picker style={styles.picker} onValueChange={languageCode => this.setState({ languageCode })} selectedValue={this.state.languageCode} mode={"dialog"}>
                      {this.languagesPickerItems}
                    </Picker>
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Profanity filter</Text>
                    <Switch style={styles.switch} onValueChange={profanityFilter => this.setState({ profanityFilter })} value={this.state.profanityFilter} />
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Word time offset</Text>
                    <Switch style={styles.switch} onValueChange={wordTimeOffset => this.setState({ wordTimeOffset })} value={this.state.wordTimeOffset} />
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Word confidence</Text>
                    <Switch style={styles.switch} onValueChange={wordConfidence => this.setState({ wordConfidence })} value={this.state.wordConfidence} />
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Automatic punctuation</Text>
                    <Switch style={styles.switch} onValueChange={automaticPunctuation => this.setState({ automaticPunctuation })} value={this.state.automaticPunctuation} />
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Model</Text>
                    <Picker style={styles.picker} onValueChange={model => this.setState = ({ model })} selectedValue={this.state.model} mode={"dropdown"}>
                      <Picker.Item label="Default" value="default" />
                      <Picker.Item label="Command and search" value="command_and_search" />
                      <Picker.Item label="Phone call" value="phone_call" />
                      <Picker.Item label="Video" value="video" />
                    </Picker>
                  </View>
                  <View style={styles.optionContainer}>
                    <Text style={styles.label}>Enhanced model</Text>
                    <Switch style={styles.switch} onValueChange={enhancedModel => this.setState({ enhancedModel })} value={this.state.enhancedModel} />
                  </View>
                </View>

                {/* <Text style={styles.sectionTitle}>Recognition metadata</Text>
                <View style={styles.optionsView}>
                </View> */}

                <Icon.Button name='cloud-upload' backgroundColor='#e5ffff' style={styles.sourceButton} color='black' onPress={() => { }} disabled={true}>
                  <Text style={styles.buttonText}>Send audio</Text>
                </Icon.Button>
              </View>

              <View style={[styles.card, { marginBottom: 20 }]}>
                <Text style={styles.heading}>Response</Text>

                <Text style={styles.sectionTitle}>Transcript</Text>
                <ScrollView style={styles.resultView}>
                  <Text style={styles.textarea} numberOfLines={1000}>{}</Text>
                </ScrollView>

                <Text style={styles.sectionTitle}>Body</Text>
                <ScrollView style={styles.resultView}>
                  <Text style={styles.textarea} numberOfLines={1000}>{}</Text>
                </ScrollView>
              </View>


            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#82ada9',
    flex: 1,
  },
  scrollView: {
    padding: 10,
  },
  card: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#b2dfdb',
    marginBottom: 10,
  },
  heading: {
    fontWeight: 'normal',
    fontSize: 30,
  },

  sourceView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceButtonContainer: {
    flex: 1,
    margin: 5,
  },
  buttonText: {
    color: 'black',
    fontSize: 18
  },
  buttonTextRed: {
    color: 'white',
    fontSize: 18
  },
  input: {
    flex: 1.3,
    backgroundColor: '#e5ffff',
    color: 'black',
    maxHeight: 24,
    borderRadius: 5,
    paddingVertical: 0,
    textAlign: 'right'
  },
  textValue: {
    fontSize: 16
  },

  optionsView: {
    flex: 1,
  },
  optionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switch: {
  },
  picker: {
    flex: 1.3,
    maxHeight: 24,
    alignItems: 'flex-end',
  },
  labelIcon: {
    paddingTop: 2,
    fontSize: 15,
    color: 'darkgrey',
    marginRight: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 18
  },
  link: {
    color: '#33b5e5',
    textDecorationLine: 'underline',
  },

  resultView: {
    padding: 10,
    maxHeight: 300,
    borderColor: '#82ada9',
    borderRadius: 5,
    borderWidth: 3,
  },
  textarea: {
  }
});
