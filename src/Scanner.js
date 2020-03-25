import React, {Component} from 'react';
import {StyleSheet, View, Alert, Dimensions, Text, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera as Camera} from 'react-native-camera';
import {Icon} from 'react-native-elements';

import Colors from './constants/colors.constant';

const {height} = Dimensions.get('window');

class Scanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
    };
  }

  componentWillUnmount() {
    this.props.navigation.state.params.getData();
  }

  setActiveQrCode = () => {
    this.scanner.reactivate();
  };

  onSuccess = e => {
    console.log('anhvt14 - ', e);
    const {data} = e;
    const arr = data && data.split('\n');
    if (!arr || arr.length !== 4) {
      Alert.alert('Error', 'QR Code is invalid. Please re-scan', [
        {text: 'OK', onPress: () => this.scanner.reactivate()},
      ]);
    } else {
      this.props.navigation.navigate('ResultDetail', {
        result: arr,
        setActiveQrCode: () => this.setActiveQrCode(),
      });
    }
    // this.props.navigation.navigate('ResultDetail', {
    //   result: ["1042743", "ROBBY2", "EMANG2", "PETRONAS2"],
    //   setActiveQrCode: () => this.setActiveQrCode(),
    // });
  };
  closeModal = () => {
    this.setState({ isShow: false });
  };

  renderGoback = () => {
    return (
      <View style={styles.backContainer}>
        <TouchableOpacity
          style={styles.backTouch}
          onPress={() => {
            this.props.navigation.goBack();
          }}>
          <Icon type="ionicon" name="ios-arrow-back" color={Colors.success} size={30} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <View>
        <QRCodeScanner
          onRead={this.onSuccess}
          ref={node => {
            this.scanner = node;
          }}
          flashMode={Camera.Constants.FlashMode.off}
          fadeIn={false}
          cameraStyle={styles.camera}
          // containerStyle={styles.container}
          topViewStyle={styles.zeroContainer}
          bottomViewStyle={styles.zeroContainer}
          showMarker={true}
          markerStyle={styles.maker}
        />
        {this.renderGoback()}
        <View style={styles.manualContainer}>
          <TouchableOpacity>
            <Text style={styles.manualText}>Dont have QR code? Manual Input</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }
}
export default Scanner;

const styles = StyleSheet.create({
  container: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    height,
  },
  zeroContainer: {
    height: 0,
    flex: 0,
  },
  maker: {
    // bor
  },
  backContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.success,
    marginLeft: 10,
    fontSize: 18,
  },
  manualContainer: {
    position: 'absolute',
    top: height - 100,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Colors.success
  },
  manualText: {
    color: Colors.success,
  },
});
