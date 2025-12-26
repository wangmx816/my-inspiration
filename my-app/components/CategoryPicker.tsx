import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { WASTE_CATEGORIES } from '~/utils/categories';
import { X } from 'lucide-react-native';

interface CategoryPickerProps {
  visible: boolean;
  selectedCategory?: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export function CategoryPicker({
  visible,
  selectedCategory,
  onSelect,
  onClose,
}: CategoryPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-gray-900 text-xl font-bold">选择危废类别</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1">
            {WASTE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.code;
              
              return (
                <TouchableOpacity
                  key={category.code}
                  onPress={() => {
                    onSelect(category.code);
                    onClose();
                  }}
                  className={`flex-row items-center p-4 border-b border-gray-100 ${
                    isSelected ? 'bg-primary-400/10' : ''
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-primary-400/20 items-center justify-center mr-3">
                    <Icon size={20} color="#f472b6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">
                      {category.code} - {category.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary-400 items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


