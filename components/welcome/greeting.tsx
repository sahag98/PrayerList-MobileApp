// @ts-nocheck
import React from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Feather } from "@expo/vector-icons";

interface GreetingProps {
  theme: string;
}
export const Greeting: React.FC<GreetingProps> = ({ theme }) => {
  const welcomeFadeIn = useSharedValue(0);

  const animatedWelcomeFadeInStyle = useAnimatedStyle(() => ({
    opacity: welcomeFadeIn.value * 1,
  }));

  const greeting = React.useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  }, []);

  const icon = React.useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 18) {
      return <Feather name="sun" size={25} color="#d8d800" />;
    }

    return (
      <Feather
        name="moon"
        size={25}
        color={theme === "dark" ? "#a6a6a6" : "#9a9a9a"}
      />
    );
  }, [theme]);

  React.useEffect(() => {
    welcomeFadeIn.value = withTiming(1, {
      duration: 2000,
      easing: Easing.ease,
    });
  }, []);

  return (
    <Animated.View
      className="flex flex-row items-center gap-2"
      style={[animatedWelcomeFadeInStyle]}
    >
      <Animated.Text className="text-2xl tracking-wide font-inter font-bold text-[#2F2D51] dark:text-[#d2d2d2]">
        {greeting}
      </Animated.Text>
      {icon}
    </Animated.View>
  );
};