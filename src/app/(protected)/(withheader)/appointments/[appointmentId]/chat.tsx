import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import { ConsultationMessage } from '@/interfaces/healthcare'
import { replaceUrlParams } from '@/utils/base'
import { timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native'

/**
 * The doctor's side of the consultation thread.
 *
 * The endpoint has no websocket and no unread cursor, so this polls while the
 * screen is open rather than pretending to be live. Ten seconds is slow enough
 * not to matter on a provider's data and fast enough that a patient asking
 * "which pharmacy?" mid-consultation gets an answer in the same conversation.
 */
const POLL_MS = 10_000

const ConsultationChat = () => {
  const { appointmentId, patientName } = useLocalSearchParams<{ appointmentId: string; patientName?: string }>()
  const { bottom } = useCustomSafeAreaInsets()
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [draft, setDraft] = useState('')
  /*
   * The API enforces the reply window (open 15 minutes before the slot, closed
   * a day after it ends) and answers 403. There is deliberately no local clock
   * check mirroring it — a provider's phone running slow would lock them out of
   * a consultation that is live on the server. Instead the 403 is shown here,
   * above the composer, rather than only as a toast that vanishes.
   */
  const [closedReason, setClosedReason] = useState<string | null>(null)
  const listRef = useRef<FlatList<ConsultationMessage>>(null)

  const url = replaceUrlParams(API_ENDPOINTS.APPOINTMENT_MESSAGES, { appointmentId })
  const { requestGET, isLoading } = useAxios<ConsultationMessage[]>(url)
  const { requestPOST, isLoading: sending } = useAxios<ConsultationMessage>(url)

  const load = async () => {
    const res = await requestGET()
    if (res.status === 200 && Array.isArray(res.data)) setMessages(res.data)
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, POLL_MS)
    return () => clearInterval(timer)
  }, [appointmentId])

  const send = async () => {
    const body = draft.trim()
    if (!body) return
    // Cleared before the request, not after: leaving the text in place while
    // the POST runs is how the same message gets sent twice.
    setDraft('')
    try {
      const res = await requestPOST({ kind: 'text', body })
      if (res.status === 201) {
        setMessages((prev) => [...prev, res.data])
        setClosedReason(null)
        listRef.current?.scrollToEnd({ animated: true })
        return
      }
      setDraft(body)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setClosedReason(
          e.response.data?.detail || 'This consultation is closed to new messages.',
        )
      }
      // useAxios already toasted why. Put the text back so it is not lost.
      setDraft(body)
    }
  }

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title={patientName || 'Messages'} backButtonRoute='/appointments' />

      {isLoading && messages.length === 0 ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center px-[32px]'>
              <ThemedText size='small' className='text-center' style={{ color: Colors.mutedTextColor }}>
                No messages yet. Anything you send here reaches the patient in their app.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => <Bubble message={item} />}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          className='px-[16px] pt-[10px] bg-white border-t border-primary/10'
          style={{ paddingBottom: bottom + 10 }}
        >
          {closedReason ? (
            <ThemedText
              size='small'
              className='mb-[8px] text-center'
              style={{ color: Colors.mutedTextColor }}
            >
              {closedReason}
            </ThemedText>
          ) : null}
          <View className='flex-row items-end gap-x-[8px]'>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={closedReason ? 'Messaging is closed' : 'Message the patient'}
            placeholderTextColor={Colors.mutedTextColor}
            editable={!closedReason}
            multiline
            className='flex-1 max-h-[110px] px-[14px] py-[10px] rounded-[20px] border border-primary/20'
            style={{ color: Colors.primaryTextColor }}
          />
          <Pressable
            onPress={send}
            disabled={sending || !draft.trim() || !!closedReason}
            className='h-[42px] w-[42px] rounded-full items-center justify-center'
            style={{
              backgroundColor: Colors.primary,
              opacity: sending || !draft.trim() || closedReason ? 0.4 : 1,
            }}
          >
            <Feather name='send' size={18} color='#FFFFFF' />
          </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

/**
 * A missed call and a system line are not messages: neither has an author and
 * neither can be replied to, so they render centred rather than as a bubble on
 * one side of the thread.
 */
const Bubble = ({ message }: { message: ConsultationMessage }) => {
  if (message.kind === 'missed_call' || message.kind === 'system') {
    return (
      <View className='items-center'>
        <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>
          {message.kind === 'missed_call' ? 'Missed call' : message.body}
          {' · '}{timeLabel(message.created_at)}
        </ThemedText>
      </View>
    )
  }

  const mine = !message.is_from_patient
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <View
        className='max-w-[82%] px-[14px] py-[10px] rounded-[16px]'
        style={{ backgroundColor: mine ? Colors.primary : '#FFFFFF', borderWidth: mine ? 0 : 1, borderColor: Colors.tabTrackBorder }}
      >
        {message.kind === 'file' ? (
          <ThemedText size='small' style={{ color: mine ? '#FFFFFF' : Colors.primaryTextColor }}>
            {message.attachment_name || 'Attachment'}
          </ThemedText>
        ) : (
          <ThemedText size='small' style={{ color: mine ? '#FFFFFF' : Colors.primaryTextColor }}>
            {message.body}
          </ThemedText>
        )}
      </View>
      <ThemedText size='small' className='mt-[3px] text-[11px]' style={{ color: Colors.mutedTextColor }}>
        {timeLabel(message.created_at)}
      </ThemedText>
    </View>
  )
}

export default ConsultationChat
