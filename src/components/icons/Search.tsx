import EvilIcons from '@expo/vector-icons/EvilIcons';

const Search = ({ color, size = 24 }: { color: string, size?: number }) => {
  return (
    <EvilIcons name="search" size={size} color={color} />
  )
}

export default Search