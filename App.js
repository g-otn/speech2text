import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Button,
  Switch,
  Linking,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-community/picker';
const languages = require('./languages.json');

// import { google } from '@google-cloud/speech/build/protos/protos';
// google.cloud.speech.v1.RecognitionConfig.AudioEncoding.

const App = () => {
  const [languageCode, setLanguageCode] = useState('pt-BR');
  const [profanityFilter, setProfanityFilter] = useState(false);
  const [wordTimeOffset, setWordTimeOffset] = useState(false);
  const [automaticPunctuation, setAutomaticPunctuation] = useState(false);
  const [model, setModel] = useState('default');
  const [enhancedModel, setEnhancedModel] = useState(false);

  const languagesPickerItems = languages.map(l => (<Picker.Item key={l.bcp47} label={l.name} value={l.bcp47} />));

  return (
    <>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View>


            <View style={styles.card}>
              <Text style={styles.heading}>Speech source</Text>

              <View style={styles.sourceView}>
                <View style={styles.sourceButtonContainer}>
                  <Icon.Button name='file-audio-o' backgroundColor='#e5ffff' style={styles.sourceButton} color='black' onPress={() => { console.log('a') }}>
                    <Text style={styles.buttonText}>Select file</Text>
                  </Icon.Button>
                </View>
                <View style={styles.sourceButtonContainer}>
                  <Icon.Button name='microphone' backgroundColor='#e5ffff' color='black' onPress={() => { console.log('a') }}>
                    <Text style={styles.buttonText}>Record voice</Text>
                  </Icon.Button>
                </View>
              </View>
            </View>


            <View style={styles.card}>
              <View style={{ alignSelf: 'flex-start' }}>
                <Text style={styles.heading} onPress={() => Linking.openURL('https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig')} >
                  Options&nbsp;<Icon style={{ fontSize: 20 }} name="external-link" />
                </Text>
              </View>

              <View style={styles.optionsView}>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Language</Text>
                  <Picker style={styles.picker} onValueChange={setLanguageCode} selectedValue={languageCode} mode={"dialog"}>
                    {languagesPickerItems}
                  </Picker>
                </View>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Profanity filter</Text>
                  <Switch style={styles.switch} onValueChange={setProfanityFilter} value={profanityFilter} />
                </View>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Word time offset</Text>
                  <Switch style={styles.switch} onValueChange={setWordTimeOffset} value={wordTimeOffset} />
                </View>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Automatic punctuation</Text>
                  <Switch style={styles.switch} onValueChange={setAutomaticPunctuation} value={automaticPunctuation} />
                </View>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Model</Text>
                  <Picker style={styles.picker} onValueChange={setModel} selectedValue={model} mode={"dropdown"}>
                    <Picker.Item label="Command and search" value="command_and_search" />
                    <Picker.Item label="Phone call" value="phone_call" />
                    <Picker.Item label="Video" value="video" />
                    <Picker.Item label="Default" value="default" />
                  </Picker>
                </View>
                <View style={styles.optionContainer}>
                  <Text style={styles.label}>Enhanced model</Text>
                  <Switch style={styles.switch} onValueChange={setEnhancedModel} value={enhancedModel} />
                </View>
              </View>
            </View>


            <View style={[styles.card, { marginBottom: 20 }]}>
              <Text style={styles.heading}>Response</Text>

              <Text style={{ fontSize: 18 }}>Transcript</Text>
              <ScrollView style={styles.resultView}>
                <Text style={styles.textarea} numberOfLines={1000}>{}</Text>
              </ScrollView>

              <Text style={{ fontSize: 18 }}>Body</Text>
              <ScrollView style={styles.resultView}>
                <Text style={styles.textarea} numberOfLines={1000}>{}</Text>
              </ScrollView>
            </View>


          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
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
    padding: 10,
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

  optionsView: {
    flex: 1,
    padding: 5,
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
  },
  labelIcon: {
    paddingTop: 2,
    fontSize: 15,
    color: 'darkgrey',
    marginRight: 5,
  },
  label: {
    flex: 1,
    fontSize: 18
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

export default App;
