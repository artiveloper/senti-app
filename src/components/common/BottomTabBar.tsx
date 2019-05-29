import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  EmitterSubscription,
} from 'react-native';
import {
  inject,
  observer,
} from 'mobx-react/native';
import {
  SafeAreaView,
  SafeAreaViewForceInsetValue,
  BottomTabBarProps as NavigationBottomTabBarProps,
  NavigationRoute,
  NavigationParams,
} from 'react-navigation';
import {
  AuthStore,
  UiStore,
} from 'stores';
import { palette } from 'constants/style';

const SAFE_AREA_INSET: {
  top: SafeAreaViewForceInsetValue;
  bottom: SafeAreaViewForceInsetValue;
} = {
  top: 'never',
  bottom: 'always',
};

interface BottomTabBarProps extends NavigationBottomTabBarProps {
  onTabPress: ({ route }: { route: NavigationRoute<NavigationParams> }) => void;
  authStore?: AuthStore;
  uiStore?: UiStore;
}

@inject('authStore', 'uiStore')
@observer
class BottomTabBar extends React.Component<BottomTabBarProps> {
  public state = {
    isVisible: true,
  };

  private onPressHandlers: {
    [key: string]: () => void;
  } = {};

  private keyboardDidShowListener?: EmitterSubscription;

  private keyboardDidHideListener?: EmitterSubscription;

  public componentDidMount() {
    if (Platform.OS === 'android') {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        this.onKeyboardDidShow,
      );

      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        this.onKeyboardDidHide,
      );
    }
  }

  public componentWillUnmount() {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove();
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
    }
  }

  public render() {
    if (!this.state.isVisible) {
      return null;
    }

    const {
      navigation: {
        state: {
          index: navigationIndex,
          routes,
        },
      },
      style,
    } = this.props;

    return (
      <View>
        <SafeAreaView
          style={[
            styles.container,
            style,
            { backgroundColor: navigationIndex === 0 ? palette.transparent.black[60] : palette.gray[100] },
          ]}
          forceInset={SAFE_AREA_INSET}
        >
          {routes.map(this.renderTabItem)}
        </SafeAreaView>
      </View>
    );
  }

  private renderTabItem = (route: NavigationRoute<NavigationParams>, index: number) => {
    const {
      navigation: {
        state: {
          index: navigationIndex,
        },
      },
      activeTintColor,
      inactiveTintColor,
      renderIcon,
    } = this.props;

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.menu}
        activeOpacity={1}
        onPress={this.getOnPressHandler(route)}
      >
        {renderIcon({
          route,
          index: index,
          focused: navigationIndex === index,
          tintColor: navigationIndex === index ? activeTintColor : inactiveTintColor,
        })}
      </TouchableOpacity>
    );
  }

  private getOnPressHandler = (route: NavigationRoute<NavigationParams>) => {
    if (!Object.prototype.hasOwnProperty.call(this.onPressHandlers, route.key)) {
      this.onPressHandlers[route.key] = () => {
        const { params = {} } = route;
        const {
          authStore,
          uiStore,
          onTabPress,
        } = this.props;

        if (params.private && !authStore!.isLoggedIn) {
          authStore!.setNextRoute(route.key);
          uiStore!.toggleAuthModal();
          return;
        }

        onTabPress({ route });
      };
    }

    return this.onPressHandlers[route.key];
  }

  private onKeyboardDidShow = () => this.setState({ isVisible: false });

  private onKeyboardDidHide = () => this.setState({ isVisible: true });
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    backgroundColor: palette.transparent.black[60],
  },
  menu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabBar;
