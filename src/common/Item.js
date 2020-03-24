import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Theme from '../constants/theme.constant';
import Colors from '../constants/colors.constant';

const Item = props => {
  const {children, iStyle, label = '', uom = ''} = props;
  return (
    <View style={[styles.container, iStyle]}>
      <Text style={styles.label}> {label} </Text>
      <Text style={styles.content}>
        {' '}
        {children} {uom}{' '}
      </Text>
    </View>
  );
};

export default Item;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginHorizontal: Theme.margin / 2,
    marginBottom: Theme.margin / 2,
  },
  label: {
    // fontFamily: 'Arial',
    color: Colors.textcolor,
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    fontFamily: 'Arial',
    fontWeight: '400',
    color: Colors.textcolors50,
  },
});
