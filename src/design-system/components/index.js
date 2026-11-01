import React, { useId } from 'react';
import { Palette } from 'lucide-react';
import { useAppearance, PRESETS } from '../appearance';
import { useLayout, LAYOUTS } from '../layouts';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';

const choices = {
  colorMode: [
    { id: 'light', name: '浅色 Light' },
    { id: 'dark', name: '深色 Dark' },
    { id: 'system', name: '跟随系统 System' }
  ],
  density: [
    { id: 'default', name: '标准 Default' },
    { id: 'comfortable', name: '舒适 Comfortable' },
    { id: 'compact', name: '紧凑 Compact' }
  ]
};
export function AppearanceControls({ compact = false }) {
  const appearance = useAppearance();
  const { layout, setLayout } = useLayout();
  const prefix = useId();
  const fields = [
    { key: 'preset', label: '设计预设', value: appearance.preset, options: PRESETS },
    { key: 'colorMode', label: '颜色模式', value: appearance.colorMode, options: choices.colorMode },
    { key: 'density', label: '信息密度', value: appearance.density, options: choices.density },
    { key: 'layout', label: '页面布局', value: layout, options: LAYOUTS }
  ];
  return (
    <div className={compact ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
      {fields.map(field => (
        <div className="min-w-0 space-y-2" key={field.key}>
          <Label htmlFor={`${prefix}-${field.key}`} className="text-xs text-muted-foreground">
            {field.label}
          </Label>
          <Select value={field.value} onValueChange={value => (field.key === 'layout' ? setLayout(value) : appearance.updateAppearance({ [field.key]: value }))}>
            <SelectTrigger id={`${prefix}-${field.key}`} aria-label={field.label} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
export function AppearanceMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="外观设置">
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div>
          <h2 className="font-semibold">外观设置</h2>
          <p className="mt-1 text-xs text-muted-foreground">视觉与布局独立选择，自动保存。</p>
        </div>
        <AppearanceControls compact />
      </PopoverContent>
    </Popover>
  );
}
