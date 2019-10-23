import React, { useMemo } from 'react';
import {
  View,
  Animated,
  StyleSheet,
} from 'react-native';
import {
  Text,
  CachableImage,
} from 'components';
import { LayoutService } from 'services';
import { palette } from 'constants/style';

interface Props {
  item: Story;
  index: number;
  animatedValue: Animated.Value;
}

const StoryItem: React.FunctionComponent<Props> = ({
  item,
  index,
  animatedValue,
}) => {
  const backgroundStyle = useMemo(() => ({
    width: LayoutService.screenWidth,
    height: LayoutService.screenHeight,
    backgroundColor: palette.gray[100],
  }), []);

  const parallexStyle = useMemo(() => ({
    transform: [{
      translateY: animatedValue!.interpolate({
        inputRange: [
          (index - 1) * LayoutService.screenHeight,
          index * LayoutService.screenHeight,
          (index + 1) * LayoutService.screenHeight,
        ],
        outputRange: [-LayoutService.screenHeight * 0.5, 0, LayoutService.screenHeight * 0.5],
        extrapolate: 'clamp',
      }),
    }],
  }), [animatedValue, index]);

  const Tags = useMemo(() => {
    return item.tags
      .map(tag => `#${tag}`)
      .map((tag: string, i: number) => (
        <Text key={`${tag}-${i}`} style={styles.tag}>
          {tag}
        </Text>
      ));
  }, [item]);

  return (
    <View style={styles.container}>
      <Animated.View style={parallexStyle}>
        <CachableImage prefix="covers" source={item.cover} style={backgroundStyle} />
      </Animated.View>
      <View style={styles.filter}>
        <View style={styles.tags}>
          {Tags}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
  },
  filter: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 128,
    backgroundColor: palette.transparent.black[40],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 48,
    paddingTop: 32,
  },
  tag: {
    margin: 4,
    color: palette.gray[10],
    fontSize: 18,
  },
  controller: {
    alignSelf: 'stretch',
  },
  bottomSpace: {
    marginBottom: 48,
  },
  iconContainer: {
    position: 'absolute',
    paddingTop: 32,
  },
  icon: {
    width: 48,
    height: 48,
    tintColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default React.memo(StoryItem);
