import Ionicons from '@expo/vector-icons/Ionicons';

const Call = ({ color, size = 24 }: { color: string, size?: number }) => {
  return (
    <Ionicons name="call" size={size} color={color} />
  )
}

export default Call;