import { LayoutDashboard, KeyRound, Palette, Table2, Activity, Sparkles, Blocks } from 'lucide-react';

export const menuItems = [
  { to: '/', label: '控制台', icon: LayoutDashboard },
  {
    key: 'design-system',
    label: '设计系统',
    icon: Palette,
    children: [
      { to: '/design-playground?view=data', label: '数据管理', icon: Table2, defaultSearch: { view: 'data' } },
      { to: '/design-playground?view=monitoring', label: '工业监测', icon: Activity },
      { to: '/design-playground?view=workspace', label: 'AI 工作台', icon: Sparkles },
      { to: '/design-playground?view=components', label: '基础组件', icon: Blocks }
    ]
  },
  { to: '/change-password', label: '修改密码', icon: KeyRound }
];
