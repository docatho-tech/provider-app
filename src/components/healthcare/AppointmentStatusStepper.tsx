import ThemedText from '@/components/common/ThemedText'
import { getAppointmentSteps, StepState } from '@/utils/appointmentUi'
import { AppointmentLike } from '@/utils/appointmentUi'
import React from 'react'
import { View } from 'react-native'

const dotColor = (state: StepState) => {
  if (state === 'done') return 'bg-[#10B981]'
  if (state === 'current') return 'bg-primary'
  if (state === 'skipped') return 'bg-[#D1D5DB]'
  return 'bg-[#E5E7EB]'
}

const AppointmentStatusStepper = ({ appointment }: { appointment: AppointmentLike }) => {
  const steps = getAppointmentSteps(appointment)
  return (
    <View className='flex-row items-center justify-between mt-[12px]'>
      {steps.map((step, i) => (
        <View key={step.key} className='flex-1 items-center'>
          <View className={`w-[10px] h-[10px] rounded-full ${dotColor(step.state)}`} />
          <ThemedText size='small' className={`text-center mt-[6px] text-[10px] ${step.state === 'current' ? 'text-primary font-semibold' : 'text-secondaryTextColor'}`} numberOfLines={2}>
            {step.label}
          </ThemedText>
          {i < steps.length - 1 ? <View className='absolute top-[4px] left-[55%] right-[-45%] h-[2px] bg-[#E5E7EB]' /> : null}
        </View>
      ))}
    </View>
  )
}

export default AppointmentStatusStepper
