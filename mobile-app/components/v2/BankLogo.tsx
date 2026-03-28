import { Image, ImageStyle } from "react-native";
import { getBankLogo } from "@/utils/bankLogo";

type Props = {
  name: string;
  style?: ImageStyle;
};

export function BankLogo({ name, style }: Props) {
  const source = getBankLogo(name);
  if (!source) return null;
  return (
    <Image
      source={source}
      style={[{ width: 40, height: 40 }, style]}
      resizeMode="contain"
    />
  );
}
