import { Layout, Modal, Text, Tooltip } from "@ui-kitten/components";
import { Info } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

type InfoTooltipProps = {
  content: string;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top start"
    | "top end"
    | "bottom start"
    | "bottom end"
    | "left start"
    | "left end"
    | "right start"
    | "right end";
  size?: number;
  useModalOnMobile?: boolean;
};

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  placement = "top end",
  size = 18,
  useModalOnMobile = true,
}) => {
  const [visible, setVisible] = useState(false);

  const Anchor = () => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setVisible(true)}
      accessibilityLabel="Info"
      accessibilityHint="Shows why this information is required"
      style={{ paddingHorizontal: 4, paddingVertical: 2 }}
    >
      <Info size={size} color="#8F9BB3" />
    </TouchableOpacity>
  );

  if (useModalOnMobile) {
    return (
      <>
        <Anchor />
        <Modal
          visible={visible}
          backdropStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onBackdropPress={() => setVisible(false)}
        >
          <Layout
            level="1"
            style={{
              padding: 16,
              borderRadius: 12,
              maxWidth: 320,
            }}
          >
            <Text category="s2" style={{ color: "#222B45" }}>
              {content}
            </Text>
          </Layout>
        </Modal>
      </>
    );
  }

  return (
    <Tooltip
      anchor={Anchor}
      visible={visible}
      onBackdropPress={() => setVisible(false)}
      placement={placement}
    >
      <View style={{ maxWidth: 260 }}>
        <Text category="c1">{content}</Text>
      </View>
    </Tooltip>
  );
};
