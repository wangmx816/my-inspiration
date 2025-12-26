import { 
  Factory, 
  Beaker, 
  Droplet, 
  Flame, 
  Battery, 
  Wrench, 
  Trash2,
  Package,
  type LucideIcon,
} from 'lucide-react-native';

export interface WasteCategory {
  code: string;
  name: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * 危废类别定义（HW01-HW49）
 */
export const WASTE_CATEGORIES: WasteCategory[] = [
  { code: 'HW01', name: '医疗废物', icon: Beaker },
  { code: 'HW02', name: '医药废物', icon: Beaker },
  { code: 'HW03', name: '废药物、药品', icon: Beaker },
  { code: 'HW04', name: '农药废物', icon: Droplet },
  { code: 'HW05', name: '木材防腐剂废物', icon: Package },
  { code: 'HW06', name: '废有机溶剂与含有机溶剂废物', icon: Droplet },
  { code: 'HW07', name: '热处理含氰废物', icon: Flame },
  { code: 'HW08', name: '废矿物油与含矿物油废物', icon: Droplet },
  { code: 'HW09', name: '油/水、烃/水混合物或乳化液', icon: Droplet },
  { code: 'HW10', name: '精（蒸）馏残渣', icon: Factory },
  { code: 'HW11', name: '染料、涂料废物', icon: Droplet },
  { code: 'HW12', name: '废有机树脂', icon: Package },
  { code: 'HW13', name: '有机树脂类废物', icon: Package },
  { code: 'HW14', name: '新化学物质废物', icon: Beaker },
  { code: 'HW15', name: '爆炸性废物', icon: Flame },
  { code: 'HW16', name: '感光材料废物', icon: Package },
  { code: 'HW17', name: '表面处理废物', icon: Wrench },
  { code: 'HW18', name: '焚烧处置残渣', icon: Flame },
  { code: 'HW19', name: '含金属羰基化合物废物', icon: Factory },
  { code: 'HW20', name: '含铍废物', icon: Factory },
  { code: 'HW21', name: '含铬废物', icon: Factory },
  { code: 'HW22', name: '含铜废物', icon: Factory },
  { code: 'HW23', name: '含锌废物', icon: Factory },
  { code: 'HW24', name: '含砷废物', icon: Factory },
  { code: 'HW25', name: '含硒废物', icon: Factory },
  { code: 'HW26', name: '含镉废物', icon: Factory },
  { code: 'HW27', name: '含锑废物', icon: Factory },
  { code: 'HW28', name: '含碲废物', icon: Factory },
  { code: 'HW29', name: '含汞废物', icon: Factory },
  { code: 'HW30', name: '含铊废物', icon: Factory },
  { code: 'HW31', name: '含铅废物', icon: Factory },
  { code: 'HW32', name: '无机氟化物废物', icon: Factory },
  { code: 'HW33', name: '无机氰化物废物', icon: Factory },
  { code: 'HW34', name: '废酸', icon: Droplet },
  { code: 'HW35', name: '废碱', icon: Droplet },
  { code: 'HW36', name: '石棉废物', icon: Package },
  { code: 'HW37', name: '有机磷化合物废物', icon: Beaker },
  { code: 'HW38', name: '有机氰化物废物', icon: Beaker },
  { code: 'HW39', name: '含酚废物', icon: Beaker },
  { code: 'HW40', name: '含醚废物', icon: Beaker },
  { code: 'HW41', name: '含有机卤化物废物', icon: Beaker },
  { code: 'HW42', name: '含有机卤化物废物', icon: Beaker },
  { code: 'HW43', name: '含多氯苯并呋喃类废物', icon: Beaker },
  { code: 'HW44', name: '含多氯苯并二噁英废物', icon: Beaker },
  { code: 'HW45', name: '含有机卤化物废物', icon: Beaker },
  { code: 'HW46', name: '含镍废物', icon: Factory },
  { code: 'HW47', name: '含钡废物', icon: Factory },
  { code: 'HW48', name: '有色金属冶炼废物', icon: Factory },
  { code: 'HW49', name: '其他废物', icon: Trash2 },
];

/**
 * 根据代码获取危废类别
 */
export function getCategoryByCode(code: string): WasteCategory | undefined {
  return WASTE_CATEGORIES.find((cat) => cat.code === code);
}

/**
 * 获取所有危废类别代码
 */
export function getCategoryCodes(): string[] {
  return WASTE_CATEGORIES.map((cat) => cat.code);
}

/**
 * 危废来源类别
 */
export const WASTE_SOURCES = [
  '生产车间',
  '实验室',
  '仓库',
  '污水处理站',
  '废气处理设施',
  '其他',
];





