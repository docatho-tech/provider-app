import Entypo from '@expo/vector-icons/Entypo';

const ChevronDown = ({ color, size = 24 }: { color: string, size?: number }) => {
  return (
    <Entypo name="chevron-down" size={size} color={color} />
  )
}

export default ChevronDown;