import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Box = ({ color, size = 24 }: { color: string, size?: number }) => {
  return (
    <FontAwesome6 name="box" size={size} color={color} />
  )
}

export default Box;