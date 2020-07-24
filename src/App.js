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

export default class App extends Component {

  recorder;
  
  isAndroid = Platform.OS === 'android'
  languagesPickerItems = require('./data/languages.json').map(l => (<Picker.Item key={l.bcp47} label={l.name} value={l.bcp47} />));

  constructor(props) {
    super(props);

    this.state = {
      // Metadata
      format: this.isAndroid ? 'amr' : 'm4a',
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
    } // iOS must convert in server, no accepted formats by the API available in Recorder

    return availableFormats;
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
    // Request permission
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

  }

  async startRecording() {
    // Request permission
    const permission = await this.requestMicrophonePermission();
    console.log(permission)
    if (permission !== RESULTS.GRANTED) {
      return;
    }

    // Start recording

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
                    <Icon.Button name='microphone' backgroundColor='#e5ffff' color='black' onPress={this.toggleVoiceRecording.bind(this)}>
                      <Text style={styles.buttonText}>Record voice</Text>
                    </Icon.Button>
                  </View>
                </View>

                <View style={styles.sourceView}>

                </View>

                <Text style={styles.sectionTitle}>File metadata</Text>
                <View style={styles.optionsView}>
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
