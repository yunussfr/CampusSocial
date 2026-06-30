import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  completeUserProfile,
  getUserProfile,
  followUser,
  registerWithEmail,
  requestAndSaveFcmToken,
  sendPasswordReset,
  setUserFcmToken,
  signInWithEmail,
  signOutUser,
  subscribeToAuthState,
  unfollowUser,
  updateUserProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(
      async nextUser => {
        setUser(nextUser);
        setError(null);

        if (!nextUser) {
          setProfile(null);
          setInitializing(false);
          return;
        }

        setProfileLoading(true);

        try {
          const nextProfile = await getUserProfile(nextUser.uid);
          setProfile(nextProfile);
        } catch (profileError) {
          setError(profileError.message);
        } finally {
          setProfileLoading(false);
          setInitializing(false);
        }
      },
      authError => {
        setError(authError.message);
        setInitializing(false);
      },
    );

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);

    try {
      return await signInWithEmail(email, password);
    } catch (loginError) {
      setError(loginError.message);
      return null;
    }
  }, []);

  const register = useCallback(async payload => {
    setError(null);

    try {
      return await registerWithEmail(payload);
    } catch (registerError) {
      setError(registerError.message);
      return null;
    }
  }, []);

  const completeProfile = useCallback(async payload => {
    setError(null);

    try {
      const nextProfile = await completeUserProfile(user.uid, payload);
      setProfile(nextProfile);

      return nextProfile;
    } catch (profileError) {
      setError(profileError.message);
      return null;
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);

    try {
      const nextProfile = await getUserProfile(user.uid);
      setProfile(nextProfile);
      return nextProfile;
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async payload => {
    if (!user) {
      return null;
    }

    setError(null);

    try {
      const nextProfile = await updateUserProfile(user.uid, payload);
      setProfile(nextProfile);
      return nextProfile;
    } catch (profileError) {
      setError(profileError.message);
      return null;
    }
  }, [user]);

  const followProfile = useCallback(async targetUserId => {
    if (!user) {
      return null;
    }

    return followUser(user.uid, targetUserId);
  }, [user]);

  const unfollowProfile = useCallback(async targetUserId => {
    if (!user) {
      return null;
    }

    return unfollowUser(user.uid, targetUserId);
  }, [user]);

  const updateFcmToken = useCallback(async fcmToken => {
    if (!user) {
      return null;
    }

    await setUserFcmToken(user.uid, fcmToken);
    return refreshProfile();
  }, [refreshProfile, user]);

  const enableNotifications = useCallback(async () => {
    if (!user) {
      return null;
    }

    await requestAndSaveFcmToken(user.uid);
    return refreshProfile();
  }, [refreshProfile, user]);

  const resetPassword = useCallback(async email => {
    setError(null);

    try {
      return await sendPasswordReset(email);
    } catch (resetError) {
      setError(resetError.message);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);

    try {
      return await signOutUser();
    } catch (logoutError) {
      setError(logoutError.message);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      initializing,
      profileLoading,
      isProfileComplete: Boolean(profile?.profileCompleted),
      error,
      login,
      register,
      completeProfile,
      refreshProfile,
      updateProfile,
      enableNotifications,
      followProfile,
      unfollowProfile,
      updateFcmToken,
      resetPassword,
      logout,
      setUser,
      setError,
    }),
    [
      completeProfile,
      error,
      initializing,
      login,
      logout,
      profile,
      profileLoading,
      refreshProfile,
      register,
      resetPassword,
      user,
      enableNotifications,
      updateFcmToken,
      updateProfile,
      followProfile,
      unfollowProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
