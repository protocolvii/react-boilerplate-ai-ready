import React, { useRef, useState, useSyncExternalStore } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Save, Settings2, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { AppearanceControls } from '../../../design-system/components';
import PreviewPanel from './PreviewPanel';

const query = '(min-width: 1280px)';
const subscribe = callback => {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const getWide = () => window.matchMedia(query).matches;
export default function PreviewDrawer({ open, onOpenChange, preview, children }) {
  const wide = useSyncExternalStore(subscribe, getWide, () => false);
  const opener = useRef(null);
  const pointerOutside = useRef(false);
  const [tab, setTab] = useState('appearance');
  const openPanel = event => {
    pointerOutside.current = false;
    opener.current = event.currentTarget;
    onOpenChange(true);
  };
  const restoreFocus = event => {
    event.preventDefault();
    if (!pointerOutside.current) opener.current?.focus();
    pointerOutside.current = false;
  };
  const handleOutsidePointer = event => {
    const target = event.detail.originalEvent.target;
    // 下拉框和复制配置弹窗通过 Portal 渲染，仍属于配置操作。
    if (target instanceof Element && target.closest('[data-radix-popper-content-wrapper], [data-slot="dialog-content"]')) {
      event.preventDefault();
      return;
    }
    pointerOutside.current = true;
  };
  const content = (
    <>
      <SheetHeader className="shrink-0 border-b pr-14">
        <SheetTitle>设计配置</SheetTitle>
        <SheetDescription>实时生效。隐藏面板后可查看完整页面，调整不会丢失。</SheetDescription>
        <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="隐藏设计配置" onClick={() => onOpenChange(false)}>
          <X />
        </Button>
      </SheetHeader>
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-4 my-3 grid shrink-0 grid-cols-2" aria-label="配置分类">
          <TabsTrigger value="appearance">外观配置</TabsTrigger>
          <TabsTrigger value="tokens">样式微调</TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          <TabsContent value="appearance" className="space-y-5">
            <AppearanceControls compact onAppearanceChange={preview.changeAppearance} onLayoutChange={preview.changeLayout} />
            {children}
          </TabsContent>
          <TabsContent value="tokens">
            <PreviewPanel preview={preview} compact />
          </TabsContent>
        </div>
      </Tabs>
      <div className="shrink-0 space-y-2 border-t bg-background p-4">
        <Button className="w-full" disabled={!preview.projectReady || preview.saving || preview.invalid.length > 0} onClick={preview.saveProject}>
          <Save />
          {preview.saving ? '保存中…' : '保存到项目'}
        </Button>
        <p className="text-xs text-muted-foreground">保存后更新项目源码及默认外观，可通过 Git 查看和撤销。</p>
        {preview.saveError && (
          <p role="alert" className="text-sm text-destructive">
            {preview.saveError}
          </p>
        )}
        {preview.saveMessage && (
          <p role="status" className="text-sm text-muted-foreground">
            {preview.saveMessage}
          </p>
        )}
      </div>
    </>
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={!wide}>
      <Button variant="outline" size="sm" onClick={openPanel} aria-expanded={open}>
        <Settings2 />
        设计配置
      </Button>
      <Button style={{ display: open ? 'none' : undefined }} onClick={openPanel} className="fixed bottom-6 right-6 z-40 shadow-lg" aria-label="打开设计配置">
        <Settings2 />
        设计配置
      </Button>
      {wide ? (
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content
            className="fixed bottom-0 right-0 top-[var(--header-height)] z-50 flex w-[26rem] flex-col border-l bg-background text-foreground shadow-xl"
            onPointerDownOutside={handleOutsidePointer}
            onFocusOutside={event => event.preventDefault()}
            onCloseAutoFocus={restoreFocus}
          >
            {content}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      ) : (
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-[26rem]" onPointerDownOutside={handleOutsidePointer} onCloseAutoFocus={restoreFocus}>
          {content}
        </SheetContent>
      )}
    </Sheet>
  );
}
