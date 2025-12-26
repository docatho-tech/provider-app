import Entypo from '@expo/vector-icons/Entypo';

const ChevronRight = ({ color, size = 24 }: { color: string, size?: number }) => {
  return (
    <Entypo name="chevron-small-right" size={size} color={color} />
  )
}

export default ChevronRight;