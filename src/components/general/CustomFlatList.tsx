import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, FlatListProps, ListRenderItem, StyleProp, View, ViewStyle } from 'react-native';

interface iCustomFlatListProps<T> {
  data: Array<T>;
  renderItem: ListRenderItem<T>;
  gap: number;
  numberOfColumns?: number;
  horizontal?: boolean;
  keyExtractor?: (item: T, index: number) => string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  useInfiniteScroll?: boolean;
  infiniteScrollAction?: () => number | null;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.JSX.Element;
  ListHeaderComponent?: React.JSX.Element;
  ListEmptyComponent?: React.JSX.Element;
  columnWrapperStyle?: StyleProp<ViewStyle>;
  extraProps?: Record<string, any>;
  useAsSlider?: boolean;
  upsidedown?: boolean;
}

const CustomFlatList = <T,>({
  data,
  renderItem,
  gap,
  numberOfColumns,
  horizontal = false,
  keyExtractor,
  contentContainerStyle,
  useInfiniteScroll = false,
  infiniteScrollAction,
  onEndReachedThreshold = 0.2,
  ListFooterComponent,
  ListHeaderComponent,
  ListEmptyComponent,
  columnWrapperStyle,
  extraProps,
  useAsSlider = false,
  upsidedown = false
}: iCustomFlatListProps<T>) => {
  const finalContentContainerStyle = {
    ...(contentContainerStyle as ViewStyle),
    gap: gap
  }

  const [showInfiniteLoader, setShowInfiniteLoader] = useState(useInfiniteScroll);  

  // Auto-trigger onEndReached for short lists when infinite scroll is enabled
  useEffect(() => {
    if (useInfiniteScroll && infiniteScrollAction && data.length > 0 && data.length <= 2) {
      // Small delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        handleOnEndReached();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data.length, useInfiniteScroll, infiniteScrollAction]);


  const handleOnEndReached = () => {    
    if(showInfiniteLoader && infiniteScrollAction) {
      const nextPageNumber = infiniteScrollAction();
      if(!nextPageNumber) {
        setShowInfiniteLoader(false);
      }
    }
  }

  if(!data.length) 
    return null;
  return (
    <FlatList
      {...extraProps as FlatListProps<T>}
      data={data}
      renderItem={renderItem}
      numColumns={numberOfColumns ? numberOfColumns : undefined}
      maxToRenderPerBatch={30}
      initialNumToRender={30}
      keyExtractor={(item, index) => keyExtractor ? keyExtractor(item, index) : index.toString()}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={finalContentContainerStyle}
      horizontal={horizontal}
      ListFooterComponent={showInfiniteLoader ? InfinityScrollLoader : ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={showInfiniteLoader ? handleOnEndReached : undefined}
      onEndReachedThreshold={showInfiniteLoader ? onEndReachedThreshold : undefined}
      ListEmptyComponent={ListEmptyComponent}
      columnWrapperStyle={columnWrapperStyle}
      pagingEnabled={useAsSlider}
      inverted={upsidedown}
    />
  )
}

export default CustomFlatList

const InfinityScrollLoader = () => {
  return (
    <View className='flex-row justify-center items-center mt-[20px]'>
      <ActivityIndicator size={50} color={Colors.primary} />
    </View>
  )
}