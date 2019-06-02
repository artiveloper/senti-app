import { Alert } from 'react-native';
import {
  observable,
  computed,
} from 'mobx';
import moment from 'moment';
import firebase from 'react-native-firebase';
import { GoogleSignin } from 'react-native-google-signin';
import {
  AccessToken,
  LoginManager,
} from 'react-native-fbsdk';
import {
  FIREBASE_IOS_CLIENT_ID,
  FIREBASE_WEB_CLIENT_ID,
} from 'constants/env';
import RootStore from './RootStore';

class AuthStore {
  @observable
  public user?: User;

  @observable
  public currentProvider?: string;

  private nextRoute?: string;

  private authStateUnsubscriber?: () => void;

  constructor(private rootStore: RootStore) { }

  @computed
  public get isLoggedIn() {
    return this.user !== undefined;
  }

  public subscribe = () => {
    this.authStateUnsubscriber = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const snapShot = await userRef.get();
        if (snapShot.exists) {
          this.user = snapShot.data() as User;
        } else {
          this.user = undefined;
        }
      } else {
        this.user = undefined;
      }
    });
  }

  public unsubscribe = () => {
    if (this.authStateUnsubscriber) {
      this.authStateUnsubscriber();
    }
  }

  public setNextRoute = (key: string) => {
    this.nextRoute = key;
  }

  public popNextRoute = () => {
    const route = `${this.nextRoute}`;
    this.nextRoute = undefined;
    return route;
  }

  public signInWithGoogle = async () => {
    if (this.currentProvider) {
      return;
    }
    this.currentProvider = 'google';

    const configureResult = await this.initGoogleSignin();
    if (!configureResult) {
      Alert.alert('로그인', '구글 플레이 서비스 초기화에 실패했습니다.');
      this.currentProvider = undefined;
      return;
    }

    return GoogleSignin.signIn()
      // @ts-ignore
      .then(data => firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken))
      .then(credential => firebase.auth().signInWithCredential(credential))
      .then(this.createUser)
      .catch((error) => {
        this.currentProvider = undefined;
        if (error.code === '-5') {
          return false;
        } else {
          throw error;
        }
      });
  }

  public signInWithFacebook = async () => {
    if (this.currentProvider) {
      return;
    }
    this.currentProvider = 'facebook';

    return LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          this.currentProvider = undefined;
          return Promise.reject({ code: 'user_cancel' });
        }
        return AccessToken.getCurrentAccessToken();
      })
      // @ts-ignore
      .then(data => firebase.auth.FacebookAuthProvider.credential(data.accessToken))
      .then(credential => firebase.auth().signInWithCredential(credential))
      .then(this.createUser)
      .catch((error) => {
        this.currentProvider = undefined;
        if (error.code === 'user_cancel') {
          return false;
        } else {
          throw error;
        }
      });
  }

  public signOut = () => {
    return firebase.auth().signOut();
  }

  private initGoogleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      await GoogleSignin.configure({
        iosClientId: FIREBASE_IOS_CLIENT_ID,
        webClientId: FIREBASE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceConsentPrompt: true,
      });
    } catch (e) {
      return false;
    }

    return true;
  }

  private createUser = async () => {
    const user = firebase.auth().currentUser;

    if (!user) {
      firebase.auth().signOut();
      this.currentProvider = undefined;
      throw new Error('로그인 중 오류가 발생했습니다.');
    }

    const userRef = firebase.firestore().collection('users').doc(user.uid);
    const storedUser = await userRef.get();
    const userData = {
      id: user.uid,
      email: user.email || (user.providerData && user.providerData[0] && user.providerData[0].email),
      name: user.displayName,
      photoUrl: user.photoURL,
      lastSignInAt: {
        seconds: moment(user.metadata.lastSignInTime).valueOf(),
        nanoseconds: 0,
      },
      createdAt: {
        seconds: moment(user.metadata.creationTime).valueOf(),
        nanoseconds: 0,
      },
    };

    if (!storedUser.exists) {
      await userRef.set(userData);
    }

    this.user = userData;
    this.currentProvider = undefined;

    return true;
  }
}

export default AuthStore;
