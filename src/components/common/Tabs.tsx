import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import ThemedText from './ThemedText'

interface TabsProps {
  tabs: {
    title: string
    value: string
  }[]
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
  const getFontSize = () => {
    if (tabs.length >= 4) {
      return 9
    }
    else if (tabs.length === 3) {
      return 12
    }
    else {
      return 14
    }
  }
  return (
    <View className='flex-row justify-between items-center gap-x-[10px] bg-[#E9E9E9] border border-[#DADADA] py-[5px] rounded-[24px] px-[5px] shadow-sm'>
      {
        tabs.map((tab, index) => (
          <Pressable className='rounded-[24px]' key={index} onPress={() => setActiveTab(tab.value)} style={{ width: `${(100 / tabs.length) - 2}%`, backgroundColor: tab.value === activeTab ? 'white' : 'transparent' }}>
            <View key={index} style={{ borderRadius: 24, paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
              <ThemedText className={`${tab.value === activeTab ? 'text-primary font-semibold' : 'text-secondaryTextColor'}`} style={{ fontSize: getFontSize() }}>
                {tab.title}
              </ThemedText>
            </View>
          </Pressable>
        ))
      }
    </View>
  )
}

export default Tabs

const styles = StyleSheet.create({})