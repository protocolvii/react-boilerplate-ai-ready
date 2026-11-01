import React, { useState } from 'react';
import { Info, LoaderCircle, Check, Settings2 } from 'lucide-react';
import { SectionHeader, StatusIndicator } from '../../components';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';

function Sample({ title, description, children }) {
  return (
    <section className="ds-panel min-w-0 space-y-5 p-[var(--panel-space)]">
      <SectionHeader title={title} description={description} />
      {children}
    </section>
  );
}
export default function ComponentGallery() {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-[var(--layout-gap)]">
      <SectionHeader title="基础组件" description="官方组合式 API，通过统一 Token 与 data-slot 密度规则适配外观。" />
      <div className="grid items-start gap-[var(--layout-gap)] xl:grid-cols-2">
        <Sample title="按钮与操作" description="主要、次要、危险、禁用与加载状态。">
          <div className="flex flex-wrap gap-2">
            <Button>主要操作</Button>
            <Button variant="secondary">次要操作</Button>
            <Button variant="outline">描边按钮</Button>
            <Button variant="ghost">轻量操作</Button>
            <Button variant="destructive">危险操作</Button>
            <Button disabled>不可用</Button>
            <Button disabled aria-busy="true">
              <LoaderCircle className="size-4 motion-safe:animate-spin" />
              处理中…
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">小尺寸</Button>
            <Button>默认尺寸</Button>
            <Button size="lg">大尺寸</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="组件提示">
                  <Settings2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>键盘聚焦也可查看此提示</TooltipContent>
            </Tooltip>
          </div>
        </Sample>
        <Sample title="输入与校验" description="明确的标签、错误反馈与焦点状态。">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sample-name">名称</Label>
              <Input id="sample-name" placeholder="输入名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample-disabled">禁用状态</Label>
              <Input id="sample-disabled" placeholder="不可编辑" disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sample-error">工作区标识</Label>
              <Input id="sample-error" defaultValue="demo space" aria-invalid="true" aria-describedby="sample-error-message" />
              <p id="sample-error-message" className="text-xs text-destructive">
                仅支持字母、数字和连字符。
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sample-textarea">补充说明</Label>
              <Textarea id="sample-textarea" placeholder="描述需要协作的内容" />
            </div>
          </div>
        </Sample>
        <Sample title="选择与开关" description="选择状态不随设计预设变化而重置。">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sample-select">默认工作区</Label>
              <Select defaultValue="design">
                <SelectTrigger id="sample-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">设计工作区</SelectItem>
                  <SelectItem value="research">研发工作区</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sample-check" checked={checked} onCheckedChange={setChecked} />
              <Label htmlFor="sample-check">接收项目更新通知</Label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sample-switch">开启自动保存</Label>
              <Switch id="sample-switch" checked={enabled} onCheckedChange={setEnabled} />
            </div>
            <Separator />
            <RadioGroup defaultValue="team" aria-label="分享范围">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="team" id="sample-radio-team" />
                <Label htmlFor="sample-radio-team">团队可见</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="private" id="sample-radio-private" />
                <Label htmlFor="sample-radio-private">仅自己可见</Label>
              </div>
            </RadioGroup>
          </div>
        </Sample>
        <Sample title="浮层与对话框" description="支持 Escape 关闭、焦点约束与键盘操作。">
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>组件预览</DialogTitle>
                  <DialogDescription>验证当前预设下的浮层、输入和焦点状态。</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="dialog-preview-name">名称</Label>
                  <Input id="dialog-preview-name" placeholder="输入内容" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>完成</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">打开侧边面板</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>详情面板</SheetTitle>
                  <SheetDescription>Sheet 用于补充信息和上下文，不阻断主要页面结构。</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  <StatusIndicator tone="info" label="正在预览" />
                  <p className="text-sm leading-relaxed text-muted-foreground">该面板沿用同一套语义颜色与密度配置。</p>
                </div>
              </SheetContent>
            </Sheet>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">打开浮层</Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-2">
                <h3 className="text-sm font-semibold">轻量设置</h3>
                <p className="text-sm text-muted-foreground">Popover 用于就地提供辅助内容。</p>
              </PopoverContent>
            </Popover>
          </div>
          <Alert>
            <Info className="size-4" />
            <AlertTitle>使用组合式组件</AlertTitle>
            <AlertDescription>浮层功能由 Radix 提供，主题只调整视觉表达。</AlertDescription>
          </Alert>
        </Sample>
        <Sample title="状态与反馈" description="业务状态保持固定语义，不借用品牌色。">
          <div className="flex flex-wrap gap-2">
            {[
              ['success', '已完成'],
              ['warning', '需注意'],
              ['error', '发生错误'],
              ['info', '处理中'],
              ['neutral', '未开始']
            ].map(([tone, label]) => (
              <StatusIndicator key={tone} tone={tone} label={label} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>默认标签</Badge>
            <Badge variant="secondary">次要标签</Badge>
            <Badge variant="outline">描边标签</Badge>
            <Badge variant="destructive">异常标签</Badge>
          </div>
          <Alert variant="destructive">
            <Info />
            <AlertTitle>操作未完成</AlertTitle>
            <AlertDescription>请检查输入信息后重新提交。</AlertDescription>
          </Alert>
        </Sample>
        <Sample title="选项卡与占位" description="切换内容与加载结构均使用统一层级。">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">基本信息</TabsTrigger>
              <TabsTrigger value="preferences">偏好设置</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="py-3 text-sm text-muted-foreground">
              这里展示用户的基本信息。
            </TabsContent>
            <TabsContent value="preferences" className="py-3 text-sm text-muted-foreground">
              这里展示通知与协作偏好。
            </TabsContent>
          </Tabs>
          <Separator />
          <div role="status" aria-label="加载占位示例" className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Sample>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>卡片容器</CardTitle>
          <CardDescription>用于有边界的独立内容，不为所有段落增加嵌套卡片。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">圆角、阴影、边框与间距均来自当前设计 Token。</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <Check />
            结构清晰
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
