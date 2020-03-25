import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import Theme from './constants/theme.constant';
import Colors from './constants/colors.constant';

const {width} = Dimensions.get('screen');
class ResultDetail extends Component {
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    const result = navigation.getParam('result');
    this.state = {
      id: result[0],
      firstName: result[1],
      lastName: result[2],
      company: result[3],
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm:ss'),
      temperature: 0,
    };
  }

  componentWillUnmount() {
    this.props.navigation.state.params.setActiveQrCode();
  }

  handleChangeTemp = temperature => {
    this.setState({
      temperature,
    });
  };

  submit = async () => {
    const listString = await AsyncStorage.getItem('List');
    let list = listString ? JSON.parse(listString) : [];
    list.unshift({...this.state});
    await AsyncStorage.setItem('List', JSON.stringify(list));
    ToastAndroid.show('Record Added.', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    this.props.navigation.goBack();
  };

  render() {
    const {id, firstName, lastName, company, temperature} = this.state;
    return (
      <ScrollView style={styles.container}>
        {/* <View style={styles.container}> */}
        <View style={styles.header}>
          <Text style={styles.headerText}>STAFF INFORMATION</Text>
        </View>
        <View style={styles.content}>
          <View style={[styles.left, styles.col]}>
            <Text style={[styles.text, styles.label]}>ID: </Text>
            <Text style={[styles.text, styles.label]}>First Name: </Text>
            <Text style={[styles.text, styles.label]}>Last Name: </Text>
            <Text style={[styles.text, styles.label]}>Company: </Text>
          </View>
          <View style={[styles.right, styles.col]}>
            <Text style={[styles.text, styles.value]}> {id} </Text>
            <Text style={[styles.text, styles.value]}> {firstName} </Text>
            <Text style={[styles.text, styles.value]}> {lastName} </Text>
            <Text style={[styles.text, styles.value]}> {company} </Text>
          </View>
          {/* <Item label="ID">{id}</Item> */}
        </View>
        <View style={styles.submit}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Temperature"
              value={temperature}
              onChangeText={temp => this.handleChangeTemp(temp)}
              keyboardType={'number-pad'}
            />
            <Text style={styles.c}>°C</Text>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => this.submit()}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
        {/* </View> */}
      </ScrollView>
    );
  }
}
export default ResultDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: Theme.margin * 2,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Theme.padding * 2,
    marginTop: Theme.margin * 2,
  },
  col: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 50,
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 2,
  },
  submit: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: Theme.radius,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  c: {
    fontWeight: '500',
    fontSize: 20,
  },
  input: {
    width: 100,
    paddingHorizontal: Theme.padding,
    paddingVertical: Theme.padding / 2,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Theme.margin * 2,
    borderWidth: 1,
    borderColor: Colors.petronas700,
    paddingHorizontal: Theme.padding * 2,
    paddingVertical: Theme.padding,
  },
  submitText: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.petronas700,
  },
  text: {
    marginVertical: 5,
  },
  label: {
    fontWeight: '700',
  },
  value: {
    fontWeight: '500',
  },
});
