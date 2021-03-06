import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Listing from '../../Listing';
import Scanner from '../../Scanner';
import ResultDetail from '../../ResultDetail';
import Test from '../../Test';
import InputManual from '../../InputManual';

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Listing: Listing,
      Scanner: Scanner,
      ResultDetail: ResultDetail,
      Test: Test,
      InputManual: InputManual,
    },
    {
      initialRouteName: 'Listing',
      headerMode: 'none',
    },
  ),
);

export default AppContainer;
