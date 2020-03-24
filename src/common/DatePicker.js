import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDatePickerVisible: false,
    };
  }

  showDatePicker = isShow => {
    this.setState({isDatePickerVisible: isShow});
  };

  render() {
    const {isDatePickerVisible} = this.state;
    return (
      <View style={styles.container}>
        <Text>componentName</Text>
      </View>
    );
  }
}
export default componentName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
