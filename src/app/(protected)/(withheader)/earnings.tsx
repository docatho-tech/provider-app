import MyEarnings from '@/components/earnings/MyEarnings'
import React from 'react'

/**
 * The same screen pushed from Profile — which is how a doctor reaches it, their
 * tab bar spending that slot on the Catalog. Back returns to where they came
 * from rather than to the dashboard.
 */
const EarningsScreen = () => <MyEarnings backRoute='/profile' />

export default EarningsScreen
