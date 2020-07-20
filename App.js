import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <Text style={styles.heading}>Audio souce</Text>
            <View style={styles.sourceView}>
              <View style={styles.sourceButtonContainer}>
                <Icon.Button name='file-audio-o' backgroundColor='#fff176' color='black' onPress={() => { console.log('a') }}>
                  Select file
                </Icon.Button>
              </View>
              <View style={styles.sourceButtonContainer}>
                <Icon.Button name='microphone' backgroundColor='#c8e6c9' color='black' onPress={() => { console.log('a') }}>
                  Record voice
                </Icon.Button>
              </View>
            </View>
            <Text style={styles.heading}>Options</Text>
            <View style={styles.optionsView}>
            </View>
            <View style={styles.resultView}>
              <Text numberOfLines={10}>asasdas</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 15,
  },
  body: {
  },
  heading: {
    fontWeight: 'normal',
    fontSize: 24,
    marginTop: 10
  },
  sourceView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'red',
  },
  sourceButtonContainer: {
    flex: 1,
    margin: 5,
  },
  sourceButton: {
    color: 'black'
  },

  optionsView: {
    borderWidth: 3,
    borderColor: 'blue',
    padding: 5,
  },

  resultView: {
    borderWidth: 3,
    borderColor: 'green',
    padding: 5,
  }
});

export default App;
