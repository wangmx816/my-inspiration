import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Camera, Mic, FileText, X } from 'lucide-react-native';
import { recognizeBillFromImage, recognizeTransactionFromVoice, recognizeTransactionFromText } from '~/services/aiRecognition';
import { toast } from 'sonner-native';

type InputType = 'text' | 'voice' | 'camera';

export default function RecognizeInputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const [inputType, setInputType] = useState<InputType | null>(null);
  const [textInput, setTextInput] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // 根据 URL 参数设置输入类型并自动启动
  useEffect(() => {
    if (params.type) {
      const type = params.type as InputType;
      if (type === 'text' || type === 'voice' || type === 'camera') {
        setInputType(type);
        
        // 如果是拍照模式，直接打开相机
        if (type === 'camera') {
          // 延迟一下，确保页面加载完成
          setTimeout(() => {
            handleTakePhoto();
          }, 300);
        }
        // 如果是语音模式，直接开始录音
        else if (type === 'voice') {
          // 延迟一下，确保页面加载和权限请求完成
          setTimeout(() => {
            startRecording();
          }, 500);
        }
        // 文本模式直接显示输入框，不需要额外操作
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.type]);

  // 请求权限
  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      toast.error('需要相机和相册权限');
      return false;
    }
    if (audioStatus !== 'granted') {
      toast.error('需要麦克风权限');
      return false;
    }
    return true;
  }, []);

  // 拍照识别
  const handleTakePhoto = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      toast.error('需要相机权限');
      router.back();
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setInputType('camera');
        // 自动开始识别
        processImageInput(result.assets[0].uri);
      } else {
        // 用户取消了拍照，返回
        router.back();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('拍照失败');
      router.back();
    }
  }, [router]);

  // 选择图片识别
  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      router.back();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setInputType('camera');
        // 自动开始识别
        await processImageInput(result.assets[0].uri);
      } else {
        // 用户取消了选择，返回
        router.back();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.error('选择图片失败');
      router.back();
    }
  };

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      if (audioStatus !== 'granted') {
        toast.error('需要麦克风权限');
        router.back();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setInputType('voice');
      toast.success('开始录音...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('录音失败');
      router.back();
    }
  }, [router]);

  // 停止录音并识别
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        setInputType('voice');
        await processVoiceInput(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast.error('停止录音失败');
    } finally {
      setRecording(null);
    }
  };

  // 处理图片识别
  const processImageInput = useCallback(async (uri: string) => {
    setIsProcessing(true);
    try {
      const result = await recognizeBillFromImage(uri);
      navigateToForm(result);
    } catch (error: any) {
      toast.error(error.message || '识别失败');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 处理语音识别
  const processVoiceInput = async (uri: string) => {
    setIsProcessing(true);
    try {
      console.log('[Recognize Input] 开始处理语音输入:', uri);
      const result = await recognizeTransactionFromVoice(uri);
      navigateToForm(result);
    } catch (error: any) {
      console.error('[Recognize Input] 语音识别失败:', error);
      const errorMessage = error.message || '识别失败';
      
      // 如果语音转文本失败，提示用户可以使用文本输入
      if (errorMessage.includes('语音转文本') || errorMessage.includes('暂不可用')) {
        toast.error(errorMessage);
        // 自动切换到文本输入模式，方便用户手动输入
        setTimeout(() => {
          setInputType('text');
          setIsProcessing(false);
        }, 1000);
      } else {
        toast.error(errorMessage);
        setIsProcessing(false);
      }
    }
  };

  // 处理文本识别
  const processTextInput = async () => {
    if (!textInput.trim()) {
      toast.error('请输入文本');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await recognizeTransactionFromText(textInput);
      navigateToForm(result);
    } catch (error: any) {
      toast.error(error.message || '识别失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 导航到表单页面并预填数据
  const navigateToForm = useCallback((data: any) => {
    const prefillData = encodeURIComponent(JSON.stringify(data));
    router.push({
      pathname: '/(modals)/add-transaction',
      params: { prefill: prefillData },
    });
  }, [router]);

  // 重置
  const handleReset = () => {
    setInputType(null);
    setTextInput('');
    setImageUri(null);
    setRecording(null);
    setIsRecording(false);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-12 pb-4 px-4 bg-white">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 text-2xl font-bold">智能识别</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Type Selector - 只有在没有指定类型时才显示 */}
        {!inputType && !params.type && (
          <View className="px-4 mb-4">
            <Text className="text-gray-500 text-sm mb-4">选择输入方式</Text>
            <View className="flex-row flex-wrap gap-3">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-1 min-w-[30%] bg-sky-400 p-4 rounded-xl items-center"
              >
                <Camera size={32} color="#fff" />
                <Text className="text-white font-semibold mt-2">拍照</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-1 min-w-[30%] bg-pink-400 p-4 rounded-xl items-center"
              >
                <Camera size={32} color="#fff" />
                <Text className="text-white font-semibold mt-2">相册</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setInputType('voice');
                  startRecording();
                }}
                className="flex-1 min-w-[30%] bg-primary-400 p-4 rounded-xl items-center"
              >
                <Mic size={32} color="#fff" />
                <Text className="text-white font-semibold mt-2">语音</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setInputType('text')}
                className="flex-1 min-w-[30%] bg-secondary-400 p-4 rounded-xl items-center"
              >
                <FileText size={32} color="#fff" />
                <Text className="text-white font-semibold mt-2">文本</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Text Input */}
        {inputType === 'text' && (
          <View className="px-4 mb-4">
            <Text className="text-gray-500 text-sm mb-2">输入账单文本</Text>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="例如：转入 HW01 医疗废物 5吨，来源：生产车间，日期：2024-01-15"
              multiline
              numberOfLines={6}
              className="bg-gray-100 p-4 rounded-lg text-gray-900 mb-4"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-gray-900">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={processTextInput}
                disabled={isProcessing}
                className="flex-1 bg-primary-400 py-3 rounded-lg"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center font-semibold text-white">识别</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Voice Input */}
        {inputType === 'voice' && (
          <View className="px-4 mb-4">
            <Text className="text-gray-500 text-sm mb-4">语音输入</Text>
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <Text className="text-yellow-800 text-sm">
                提示：语音识别需要先转换为文本。请先录音，然后我们会尝试识别，如果失败，您可以手动输入文本。
              </Text>
            </View>
            <View className="items-center mb-4">
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-primary-400'
                }`}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Mic size={40} color="#fff" />
                )}
              </TouchableOpacity>
              <Text className="text-gray-600 mt-4">
                {isRecording ? '正在录音，点击停止' : isProcessing ? '正在识别...' : '点击开始录音'}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-gray-900">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputType('text')}
                className="flex-1 bg-secondary-400 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-white">改用文本输入</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image Input */}
        {inputType === 'camera' && imageUri && (
          <View className="px-4 mb-4">
            <Text className="text-gray-500 text-sm mb-2">预览图片</Text>
            <Image source={{ uri: imageUri }} className="w-full h-64 rounded-lg mb-4" />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-gray-900">重新选择</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => processImageInput(imageUri)}
                disabled={isProcessing}
                className="flex-1 bg-primary-400 py-3 rounded-lg"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center font-semibold text-white">识别</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

