/* global jest */

jest.mock('@react-native-community/datetimepicker', () => {
  return function MockDateTimePicker() {
    return null;
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');

  function MockMapView({children, ...props}) {
    return React.createElement(View, props, children);
  }

  function MockMarker(props) {
    return React.createElement(View, props);
  }

  MockMapView.Marker = MockMarker;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});
