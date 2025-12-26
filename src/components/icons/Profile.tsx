import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ProfileIcon = ({ color, type = "solid", size = 24 }: { color: string, type?: "solid" | "outline", size?: number }) => {
  return (
    <MaterialCommunityIcons name={type === "solid" ? "account" : "account-outline"} size={size} color={color} />
  )
}

export default ProfileIcon;