import React from 'react';
import {
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  withNavigation,
  NavigationInjectedProps,
} from 'react-navigation';
import {
  observer,
  inject,
} from 'mobx-react/native';
import { StoryItem } from 'components';
import { StoryState } from 'stores/states';
import {
  playAudioAction,
  stopAudioAction,
  setCurrentStoryAction,
  readStoriesByTagAction,
  resetStoriesWithTagAction,
} from 'stores/actions';
import { palette } from 'constants/style';

const {
  width: deviceWidth,
  height: deviceHeight,
} = Dimensions.get('window');

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 100 };

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface StoryListProps {
  storyState?: StoryState;
}

@inject('storyState')
@observer
class StoryList extends React.Component<StoryListProps & NavigationInjectedProps> {
  private swiperAnimation = new Animated.Value(0);

  private previousItem?: string;

  public componentDidMount() {
    this.paginate();
  }

  public componentWillUnmount() {
    stopAudioAction();
    resetStoriesWithTagAction();
  }

  public render() {
    const { tagStoryIds } = this.props.storyState!;

    return (
      <AnimatedFlatList
        data={tagStoryIds.slice()}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        onEndReached={this.paginate}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: this.swiperAnimation } } }],
          { useNativeDriver: true },
        )}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        style={styles.container}
        scrollEnabled
        pagingEnabled
        horizontal={false}
        scrollEventThrottle={1}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    );
  }

  private renderItem = ({ item, index }: { item: string; index: number }) => (
    <StoryItem storyId={item} index={index} animatedValue={this.swiperAnimation} />
  )

  private keyExtractor = (item: string) => item;

  private paginate = () => {
    const tagId = this.props.navigation.getParam('tagId', '');
    readStoriesByTagAction(tagId);
  }

  private onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ item: string }> }) => {
    if (viewableItems.length > 0) {
      const currentItem = viewableItems[0].item;
      if (this.previousItem !== currentItem) {
        const story = this.props.storyState!.stories[currentItem];
        setCurrentStoryAction(story);
        playAudioAction(story.audio);
        this.previousItem = currentItem;
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: palette.gray[100],
  },
});

export default withNavigation(StoryList);
