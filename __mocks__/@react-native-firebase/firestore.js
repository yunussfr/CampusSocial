const emptySnapshot = {
  docs: [],
};

const query = {
  onSnapshot: jest.fn(onData => {
    onData(emptySnapshot);
    return jest.fn();
  }),
  orderBy: jest.fn(() => query),
  where: jest.fn(() => query),
};

const collection = {
  doc: jest.fn(() => ({
    get: jest.fn(() =>
      Promise.resolve({
        exists: false,
        id: 'mock',
        data: () => null,
      }),
    ),
    set: jest.fn(),
  })),
  orderBy: jest.fn(() => query),
  where: jest.fn(() => query),
};

const firestoreInstance = {
  collection: jest.fn(() => collection),
  FieldValue: {
    serverTimestamp: jest.fn(() => new Date()),
  },
};

export default function firestore() {
  return firestoreInstance;
}

firestore.FieldValue = {
  serverTimestamp: jest.fn(() => new Date()),
};
