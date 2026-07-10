const analytics = {
  logEvent: jest.fn(() => Promise.resolve()),
  logScreenView: jest.fn(() => Promise.resolve()),
};

export default jest.fn(() => analytics);
