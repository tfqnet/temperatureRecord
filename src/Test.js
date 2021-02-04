import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

import Colors from './constants/colors.constant';
import Theme from './constants/theme.constant';

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  convertFileToBase64 = async file => {
    try {
      return await RNFS.readFile(file, 'base64');
    } catch (error) {
      return null;
    }
  };
  share = async () => {
    const type = 'image/png';
    // const type =
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // `data:${type};base64,` + base64Data;
    const url = 'file:///storage/emulated/0/Pictures/Screenshots/1.png';
    const base64Data = this.convertFileToBase64(url);
    const configs = {
      url: `data:${type};base64,` + base64Data,
    };
    Share.open(configs)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  };
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.share()}>
          <View style={styles.border}>
            <Text style={styles.shareButton}>Share</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.petronas,
    backgroundColor: Colors.petronas,
    paddingHorizontal: Theme.padding * 3,
    paddingVertical: Theme.padding,
    borderRadius: Theme.radius,
  },
  shareButton: {
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
});
