import React from 'react';
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { updateSearchQueryAction } from 'stores/actions';
import { palette } from 'constants/style';

const SEARCH_ICON = { uri: 'ic_search_active' };

export interface SearchBarProps {}

class SearchBar extends React.PureComponent<SearchBarProps> {
  public render() {
    return (
      <View style={styles.container}>
        <View style={styles.bar}>
          <Image source={SEARCH_ICON} style={styles.icon} />
          <TextInput
            placeholder="검색"
            placeholderTextColor={palette.gray[50]}
            onChangeText={this.onChangeText}
            spellCheck={false}
            autoCorrect={false}
            autoCapitalize="none"
            dataDetectorTypes="none"
            keyboardType="default"
            returnKeyType="search"
            underlineColorAndroid="transparent"
            multiline={false}
            maxLength={40}
            blurOnSubmit
            enablesReturnKeyAutomatically
            style={styles.input}
          />
        </View>
      </View>
    );
  }

  private onChangeText = (text: string) => {
    updateSearchQueryAction(text);
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: palette.gray[80],
    borderBottomWidth: 0.5,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.select({
      ios: 4,
      android: 0,
    }),
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: palette.gray[80],
  },
  icon: {
    width: 14,
    height: 14,
    marginLeft: 8,
    tintColor: palette.gray[50],
  },
  input: {
    flex: 1,
    padding: 6,
    fontSize: 15,
    color: palette.gray[20],
  },
});

export default SearchBar;
