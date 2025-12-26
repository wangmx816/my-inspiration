import { View, TouchableOpacity, Animated } from 'react-native';
import { Plus, FileText, Mic, Camera } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';

interface FloatingActionButtonProps {
  onAddTransaction?: () => void;
  onTextInput?: () => void;
  onVoiceInput?: () => void;
  onCameraInput?: () => void;
}

export function FloatingActionButton({
  onAddTransaction,
  onTextInput,
  onVoiceInput,
  onCameraInput,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleMainPress = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      // 如果有智能识别选项，展开子按钮；否则直接添加交易
      if (onTextInput || onVoiceInput || onCameraInput) {
        setIsOpen(true);
      } else {
        // 没有智能识别选项时，直接调用添加交易
        onAddTransaction?.();
      }
    }
  };

  const handleSubButtonPress = (callback?: () => void) => {
    setIsOpen(false);
    setTimeout(() => {
      callback?.();
    }, 200);
  };

  return (
    <View className="absolute bottom-6 right-6">
      {/* Sub Buttons */}
      {isOpen && (
        <>
          {/* 手动添加交易按钮 - 最上方 */}
          {onAddTransaction && (
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -240],
                    }),
                  },
                  { scale: scaleAnim },
                ],
                opacity: scaleAnim,
              }}
              className="absolute bottom-20 right-0"
            >
              <TouchableOpacity
                onPress={() => handleSubButtonPress(onAddTransaction)}
                className="w-14 h-14 rounded-full bg-gray-600 items-center justify-center shadow-lg"
              >
                <Plus size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* 拍照识别按钮 */}
          {onCameraInput && (
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -180],
                    }),
                  },
                  { scale: scaleAnim },
                ],
                opacity: scaleAnim,
              }}
              className="absolute bottom-20 right-0"
            >
              <TouchableOpacity
                onPress={() => handleSubButtonPress(onCameraInput)}
                className="w-14 h-14 rounded-full bg-sky-400 items-center justify-center shadow-lg"
              >
                <Camera size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* 语音识别按钮 */}
          {onVoiceInput && (
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -120],
                    }),
                  },
                  { scale: scaleAnim },
                ],
                opacity: scaleAnim,
              }}
              className="absolute bottom-20 right-0"
            >
              <TouchableOpacity
                onPress={() => handleSubButtonPress(onVoiceInput)}
                className="w-14 h-14 rounded-full bg-primary-400 items-center justify-center shadow-lg"
              >
                <Mic size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* 文本识别按钮 - 最下方 */}
          {onTextInput && (
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -60],
                    }),
                  },
                  { scale: scaleAnim },
                ],
                opacity: scaleAnim,
              }}
              className="absolute bottom-20 right-0"
            >
              <TouchableOpacity
                onPress={() => handleSubButtonPress(onTextInput)}
                className="w-14 h-14 rounded-full bg-secondary-400 items-center justify-center shadow-lg"
              >
                <FileText size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      )}

      {/* Main Button */}
      <TouchableOpacity
        onPress={handleMainPress}
        className="w-16 h-16 rounded-full bg-primary-400 items-center justify-center shadow-lg"
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Plus size={28} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
