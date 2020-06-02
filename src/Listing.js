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
import LinearGradient from 'react-native-linear-gradient';
import Swipeable from 'react-native-swipeable-row';
import {Icon} from 'react-native-elements';

import Colors from './constants/colors.constant';
import Images from './constants/image.constant';
import Theme from './constants/theme.constant';
import Item from './common/Item';
// import RECORDS from './mockData';

const {width, height} = Dimensions.get('window');

class Listing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      isVisibleExport: false,
      isShowDatePicker: false,
      exportDate: new Date(),
      isModalVisible: false,
      selectedId: '',
      selectedFirstName: '',
      selectedLastName: '',
      selectedCompany: '',
      selectedDate: '',
      selectedTime: '',
      selectedTemperature: '',
      selectedColor: '',
    };
  }

  async componentDidMount() {
    await this.getData();
  }

  async getData() {
    const listString = await AsyncStorage.getItem('List');
    let list = listString ? JSON.parse(listString) : [];
    this.setState({list});
    // this.setState({
    //   list: RECORDS,
    // })
  }

  openScanner = () => {
    this.props.navigation.navigate('Scanner', {getData: () => this.getData()});
  };
  exportExcel = () => {
    this.setState({isVisibleExport: true});
  };

  onDelete = async index => {
    var {list} = this.state;
    await list.splice(index, 1);
    await AsyncStorage.setItem('List', JSON.stringify(list)).then(() => {
      this.setState({
        list,
      });
    });
  };

  renderHeader = () => {
    return (
      // <View style={[styles.headerContainer]}>
      <LinearGradient
        style={[styles.headerContainer]}
        start={{x: 0.6, y: 1}}
        end={{x: 1.7, y: 1}}
        colors={[Colors.petronas700, Colors.info50]}>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => this.openScanner()}>
          <Image style={styles.image} source={Images.qrCode} />
          {/* <Text style={styles.headerText}>Scan</Text> */}
        </TouchableOpacity>
        <Text style={styles.title}>List</Text>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => this.exportExcel()}>
          <Image style={styles.image} source={Images.export} />
          {/* <Text style={styles.headerText}>Export</Text> */}
        </TouchableOpacity>
      </LinearGradient>
      // </View>
    );
  };

  keyExtractor = (item, index) => `${item.id}${index}`;

  onClickItem = (item, color) => {
    console.log('anhvt14 - onClickItem', item);
    // const {isModalVisible} = this.state;
    this.setState({
      isModalVisible: true,
      selectedId: item.id,
      selectedFirstName: item.firstName,
      selectedLastName: item.lastName,
      selectedCompany: item.company,
      selectedDate: item.date,
      selectedTime: item.time,
      selectedTemperature: item.temperature,
      selectedColor: color,
    });
  };

  renderDeleteButton = index => {
    return (
      <View style={styles.deleteView}>
        <TouchableOpacity
          style={styles.rightButtonTouch}
          onPress={() => {
            this.onDelete(index);
          }}>
          <Icon name="trash" type="entypo" color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  renderItem = ({item, index}) => {
    const color =
      item && item.temperature >= 37.5
        ? Colors.danger700
        : item.temperature >= 37
        ? Colors.warning700
        : Colors.success700;
    return (
      <Swipeable rightButtons={[this.renderDeleteButton(index)]}>
        <TouchableOpacity onPress={() => this.onClickItem(item, color)}>
          <View style={styles.card}>
            <View style={[styles.col, styles.left]}>
              <Text style={styles.nameLabel} numberOfLines={1}>
                {((item && item.firstName) || '') +
                  ' ' +
                  ((item && item.lastName) || '')}
              </Text>
              <Text style={styles.companyLabel} numberOfLines={1}>
                {item && item.company}
              </Text>
              <Text style={styles.timeLabel} numberOfLines={2}>
                {((item && item.time) || '') +
                  ' ' +
                  ((item && item.date) || '')}
              </Text>
            </View>
            <View style={[styles.col, styles.right]}>
              <View style={[styles.tempContainer, {backgroundColor: color}]}>
                <Text style={styles.tempText}>
                  {item && item.temperature
                    ? parseFloat(item.temperature).toFixed(1)
                    : 0}
                  {'°C'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
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
    }

    const exportDateString = moment(exportDate).format('YYYY MMM DD h-mm-ss a');

    // export to excel file
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
    const filename = 'Records ' + exportDateString + '.xlsx';
    var file = RNFS.ExternalDirectoryPath + '/' + filename;
    console.log('anhvt14 - ExternalDirectoryPath', file);
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
            filename,
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

  renderBackgroundModal = () => {
    return (
      <View style={styles.modalBackground}>
        <TouchableOpacity
          style={styles.modalTouchOutSite}
          onPress={() => {
            this.setState({
              isModalVisible: false,
            });
          }}
        />
      </View>
    );
  };

  renderModal = () => {
    const {
      selectedId,
      selectedFirstName,
      selectedLastName,
      selectedCompany,
      selectedDate,
      selectedTime,
      selectedTemperature,
      selectedColor,
    } = this.state;
    return (
      <View style={styles.modalMainContainer}>
        <View style={[styles.modalHeader, {backgroundColor: selectedColor}]}>
          <Text style={styles.modalHeaderText}>Employee Info</Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            ID:
            <Text style={styles.font300}>{' ' + selectedId}</Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            First name:
            <Text style={styles.font300}>{' ' + selectedFirstName}</Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            Last name:
            <Text style={styles.font300}>{' ' + selectedLastName}</Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            Company:
            <Text style={styles.font300}>{' ' + selectedCompany}</Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            Temp:
            <Text style={styles.font300}>
              {' ' + selectedTemperature + '°C'}
            </Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            Date:
            <Text style={styles.font300}>{' ' + selectedDate}</Text>
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentLabel}>
            Time:
            <Text style={styles.font300}>{' ' + selectedTime}</Text>
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const {list, isModalVisible} = this.state;
    // console.log("anhnk7 - list temp", JSON.stringify(list))
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
        {isModalVisible && this.renderBackgroundModal()}
        {isModalVisible && this.renderModal()}
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
  font300: {
    fontWeight: '300',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: Theme.padding,
    marginVertical: Theme.margin / 2,
    // paddingHorizontal: Theme.padding,
    backgroundColor: Colors.white,
    borderRadius: Theme.radius,
    shadowColor: Colors.black,
    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
    // borderLeftWidth: 10,
  },
  col: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  left: {
    flex: 2,
    paddingHorizontal: Theme.padding,
    paddingVertical: Theme.padding,
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    // height: 48,
    width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.padding,
    paddingVertical: 0,
    // backgroundColor: Colors.petronas,
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
  deleteView: {
    flex: 1,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    // paddingLeft: 10,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalTouchOutSite: {
    flex: 1,
    width: '100%',
  },
  modalMainContainer: {
    position: 'absolute',
    width: '80%',
    // height: 100,
    top: width / 5,
    left: width / 10,
    backgroundColor: Colors.white,
    borderRadius: Theme.radius,
    shadowColor: Colors.black,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 2,
  },
  modalHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.petronas700,
    borderRadius: Theme.radius,
    paddingVertical: Theme.padding,
  },
  contentView: {
    paddingHorizontal: Theme.padding,
    paddingVertical: Theme.padding / 2,
  },
  contentLabel: {
    fontWeight: '700',
  },
  modalHeaderText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  nameLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  companyLabel: {
    fontSize: 14,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.gray700,
  },
  tempContainer: {
    flex: 1,
    width: '100%',
    borderRadius: Theme.radius,
    // backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  rightButtonTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
