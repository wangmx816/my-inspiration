智能危废转移联单App完整实现

1. 安装依赖包

安装必需的依赖：

- expo-sqlite - 本地数据库
- nativewind 和 tailwindcss - 样式
- zustand - 状态管理
- date-fns - 日期处理
- lucide-react-native - 图标
- react-native-gifted-charts - 图表展示
- sonner-native - Toast提示
2. 数据库设计与初始化

**创建 `db/sqlite/schema.ts`**
定义数据库表结构：

- accounts 表：危废贮存场所贮存信息（id, name, balance, icon, created_at）
- transactions 表：转入转出记录（id, type, amount, category, account_id, date, description, created_at）
**创建 `db/sqlite/database.ts`**

- 初始化SQLite数据库连接
- 创建表结构
- 提供CRUD操作的工具函数
3. 状态管理

**创建 `store/useAccountStore.ts`**

- 危废贮存场所列表状态
- 总贮存量计算
- 危废贮存场所CRUD操作
**创建 `store/useTransactionStore.ts`**

- 转入转出记录列表
- 转入/转出统计
- 转入转出CRUD操作
4. 实现四个Tab页面

**修改 `app/(tabs)/_layout.tsx`**
创建4个tab：

- 首页 (index) - house图标
- 统计 (statistics) - chart-bar图标  
- 危废贮存场所 (wallet) - wallet图标
- 个人资料 (profile) - user图标
**创建 `app/(tabs)/index.tsx` - 首页**

- 顶部显示用户邮箱和搜索按钮
- 总贮存量卡片（显示总贮存量、转入、转出）
- 最近账单列表
- 右下角浮动添加按钮（+常规表单、文本输入、语音识别、相机图像识别）
**创建 `app/(tabs)/statistics.tsx` - 统计页面**

- 标题栏「统计」
- 时间周期切换（每周/每月/每年）
- 危废贮存场所切换（合计/每个危废贮存场所）
- 柱状图切换展示总贮存量、转入、转出数据
- 明细列表展示
**创建 `app/(tabs)/wallet.tsx` - 危废贮存场所页面**

- 顶部显示总贮存量
- 危废贮存场所列表（显示名称、图标、总贮存量）
- 右上角添加总废贮存场所按钮
**创建 `app/(tabs)/profile.tsx` - 个人资料页面**

- 头像和邮箱显示
- 功能列表：编辑资料、界面设置、隐私政策、登出
5. 模态框页面

**创建 `app/(modals)/add-transaction.tsx`**
添加/编辑转入转出记录表单：

- 类型选择（转入/转出）
- 危废贮存场所选择
- 危废类别选择（下拉菜单）
- 危废来源选择
- 日期选择
- 危废量输入
- 描述输入（可选）
- 提交按钮
**创建 `app/(modals)/add-account.tsx`**
添加/编辑危废贮存场所表单：

- 危废贮存场所名称
- 初始贮存量
- 图标选择
- 提交按钮
6. 可复用组件

**创建 `components/BalanceCard.tsx`**

- 总贮存量卡片组件
- 显示总贮存量、转入、转出
**创建 `components/TransactionItem.tsx`**

- 转入转出记录列表项
- 显示类别图标、名称、贮存量、日期
**创建 `components/AccountItem.tsx`**

- 危废贮存场所列表项组件
- 显示图标、名称、余额
**创建 `components/FloatingActionButton.tsx`**

- **创建 `components/FloatingActionButton.tsx`**

- 右下角浮动按钮组
- 主按钮+子按钮展开动画
**创建 `components/CategoryPicker.tsx`**

- 危废类别选择器
- 预定义类别（HW01、HW02、HW03、……、HW49）
7. 工具函数

**创建 `utils/format.ts`**

- 危废量格式化函数
- 日期格式化函数
**创建 `utils/categories.ts`**

- 预定义危废来源类别
- 类别图标映射
8. 样式配置

**配置 `tailwind.config.js`**

- 配置主题色：pink-400, sky-400
- 配置dark mode
**更新 `constants/theme.ts`**

- 添加应用主题色配置
To-dos

[] 安装所有必需的npm包（expo-sqlite、nativewind、zustand、date-fns、lucide-react-native、react-native-gifted-charts等）
[] 配置NativeWind和Tailwind CSS，包括tailwind.config.js和babel配置
[] 创建数据库schema定义和初始化逻辑（db/sqlite目录）
[] 创建Zustand状态管理stores（危废贮存场所和转入转出记录）
[] 更新tab布局，创建4个tab页面（首页、统计、危废贮存场所、个人资料）
[] 实现首页：总贮存量卡片、最近转入转出列表、浮动按钮
[] 实现统计页面：图表展示、时间筛选、转入转出列表
[] 实现危废贮存场所页面：危废贮存场所列表、总贮存量显示
[] 实现个人资料页面：用户信息、设置选项
[] 创建模态框页面：添加转入转出列表、添加危废贮存场所
[] 创建可复用组件（BalanceCard、TransactionItem、AccountItem、FloatingActionButton等）
[] 创建工具函数（格式化、类别定义等）