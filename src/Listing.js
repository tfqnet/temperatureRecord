import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-community/async-storage';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import RNFS, {writeFile} from 'react-native-fs';
import XLSX from 'xlsx';
import Share from 'react-native-share';
import moment from 'moment';

import Colors from './constants/colors.constant';
import Images from './constants/image.constant';
import Theme from './constants/theme.constant';
import Item from './common/Item';

const {width, height} = Dimensions.get('window');

class Listing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      isVisibleExport: false,
      isShowDatePicker: false,
      exportDate: new Date(),
    };
  }

  async componentDidMount() {
    await this.getData();
  }

  async getData() {
    const listString = await AsyncStorage.getItem('List');
    let list = listString ? JSON.parse(listString) : [];
    this.setState({list});
  }

  openScanner = () => {
    this.props.navigation.navigate('Scanner', {getData: () => this.getData()});
  };
  exportExcel = () => {
    this.setState({isVisibleExport: true});
  };

  renderHeader = () => {
    return (
      <View style={[styles.headerContainer]}>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => this.openScanner()}>
          <Image style={styles.image} source={Images.qrCode} />
          <Text style={styles.headerText}>Scan</Text>
        </TouchableOpacity>
        <Text style={styles.title}>List</Text>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => this.exportExcel()}>
          <Image style={styles.image} source={Images.export} />
          <Text style={styles.headerText}>Export</Text>
        </TouchableOpacity>
      </View>
    );
  };
  keyExtractor = (item, index) => `${item.id}${index}`;

  onClickItem = item => {
    console.log('anhvt14 - onClickItem', item);
  };

  renderItem = ({item, index}) => {
    const color =
      item && item.temperature >= 37.5
        ? Colors.danger700
        : item.temperature >= 37
        ? Colors.warning700
        : Colors.success700;
    return (
      <TouchableOpacity onPress={() => this.onClickItem(item)}>
        <View style={[styles.card, {borderLeftColor: color}]}>
          <View style={[styles.col, styles.left]}>
            <Item label="ID"> {item && item.id} </Item>
            <Item label="First Name"> {item && item.firstName} </Item>
            <Item label="Last Name"> {item && item.lastName} </Item>
            <Item label="Company"> {item && item.company} </Item>
          </View>
          <View style={[styles.col, styles.right]}>
            <Item label="Temp" uom="°C">
              {' '}
              {item && item.temperature
                ? parseFloat(item.temperature).toFixed(1)
                : 0}{' '}
            </Item>
            <Item label="Date"> {item && item.date} </Item>
            <Item label="Time"> {item && item.time} </Item>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  setDate = exportDate => {
    this.setState({exportDate, isShowDatePicker: false});
  };

  convertFileToBase64 = async file => {
    try {
      return await RNFS.readFile(file, 'base64');
    } catch (error) {
      console.log('anhvt14 - error', error);
      return null;
    }
  };
  share = async () => {
    const {exportDate} = this.state;
    const dataStrinng = await AsyncStorage.getItem('List');
    const list = dataStrinng && JSON.parse(dataStrinng);
    let results = [];
    if (list && list.length > 0) {
      results = list.filter(item =>
        moment(exportDate).isSame(item.date, 'day'),
      );
      console.log('anhvt14 - share - exportDate', exportDate);
      console.log('anhvt14 - share - list', list);
      console.log('anhvt14 - share - results', results);
    }

    // export to excel file
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
    var file = RNFS.ExternalDirectoryPath + '/Records.xlsx';
    writeFile(file, wbout, 'ascii')
      .then(r => {
        console.log('anhvt14 - write file successfully', r);
        this.setState({isVisibleExport: false}, async () => {
          const myUrl = 'file:/' + file;
          const type =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          console.log('anhvt14 - share file1', myUrl);
          const base64Data = await this.convertFileToBase64(file);
          const shareOptions = {
            title: 'Share file',
            url: `data:${type};base64,` + base64Data,
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          try {
            const ShareResponse = await Share.open(shareOptions);
            RNFS.unlink(file);
            console.log('anhvt14 - ShareResponse', ShareResponse);
          } catch (error) {
            console.log('Error =>', error);
            RNFS.unlink(file);
          }
        });
      })
      .catch(e => {
        console.log('anhvt14 - write file failed', e);
      });
  };

  renderExportExcelPopup = () => {
    const {isVisibleExport, isShowDatePicker, exportDate} = this.state;
    const stringDate = exportDate && moment(exportDate).format('YYYY-MM-DD');
    return (
      <Modal
        isVisible={isVisibleExport}
        style={styles.modalContainer}
        onBackButtonPress={() => this.setState({isVisibleExport: false})}
        onBackdropPress={() => this.setState({isVisibleExport: false})}>
        <View style={styles.modalExport}>
          <TouchableOpacity
            onPress={() => this.setState({isShowDatePicker: true})}>
            <View style={styles.datePickerButton}>
              <Text>{!exportDate ? 'SELECT DATE' : stringDate}</Text>
              <EvilIcons
                name="calendar"
                size={30}
                color={Colors.gray}
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.share()}
            style={styles.shareButton}>
            <Text>SHARE</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isShowDatePicker}
            mode="date"
            onConfirm={this.setDate}
            onCancel={() => this.setState({isShowDatePicker: false})}
          />
        </View>
      </Modal>
    );
  };

  render() {
    const {list} = this.state;
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        {this.renderExportExcelPopup()}
        <FlatList
          data={list}
          renderItem={this.renderItem}
          extraData={this.state}
          keyExtractor={this.keyExtractor}
        />
      </View>
    );
  }
}
export default Listing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray300,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: Theme.padding,
    marginVertical: Theme.margin / 2,
    paddingHorizontal: Theme.padding,
    backgroundColor: Colors.white,
    borderRadius: Theme.radius,
    shadowColor: Colors.black,
    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 10,
  },
  col: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  left: {
    flex: 2,
  },
  right: {
    flex: 1,
  },
  headerContainer: {
    // height: 48,
    width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.padding,
    paddingVertical: Theme.padding,
    backgroundColor: Colors.petronas,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Noteworthy',
    color: Colors.white,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Arial',
    color: Colors.white,
  },
  image: {
    width: 30,
    height: 30,
  },
  touch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 0,
    padding: 0,
    borderRadius: 0,
    backgroundColor: Colors.transparent,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalExport: {
    height: height / 2,
    width: width - 50,
    backgroundColor: Colors.white,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButton: {
    borderWidth: 1,
    width: (width * 2) / 3,
    borderColor: Colors.gray,
    borderRadius: Theme.radius,
    padding: Theme.padding / 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  shareButton: {
    paddingVertical: Theme.padding / 2,
    paddingHorizontal: Theme.padding * 2,
    borderRadius: Theme.radius,
    borderWidth: 1,
    borderColor: Colors.black,
  },
});
