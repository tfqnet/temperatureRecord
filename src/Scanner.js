import React, {Component} from 'react';
import {StyleSheet, View, Alert, Dimensions} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera as Camera} from 'react-native-camera';

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
  };
  closeModal = () => {
    this.setState({isShow: false});
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
});
