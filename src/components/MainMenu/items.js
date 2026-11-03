import { BookOpen } from 'lucide-react';

// 首个业务模块接入时，将默认入口替换为业务菜单；向导仍可从右上角开发工具访问。
export const menuItems = import.meta.env.DEV ? [{ to: '/', label: '使用向导', icon: BookOpen }] : [];
