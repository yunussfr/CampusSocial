const authInstance = {
  createUserWithEmailAndPassword: jest.fn(),
  currentUser: null,
  onAuthStateChanged: jest.fn(callback => {
    callback(null);
    return jest.fn();
  }),
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export default function auth() {
  return authInstance;
}
