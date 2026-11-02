import React, { useId, useRef, useState } from 'react';
import { Save, Undo2, RotateCcw, Download, Upload, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { FIELD_GROUPS, validValue } from './fields';

function colorHex(value) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.fillStyle = value || '#000000';
  context.fillRect(0, 0, 1, 1);
  return `#${[...context.getImageData(0, 0, 1, 1).data]
    .slice(0, 3)
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}
function TokenField({ field, preview }) {
  const id = useId();
  const value = preview.values[field.token] ?? '';
  const invalid = !validValue(field, value);
  const baseline = preview.baseline[field.token] || '';
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{field.label}</Label>
      <div className="flex items-center gap-2">
        {field.property === 'color' && (
          <input
            type="color"
            value={colorHex(invalid || !value ? baseline : value)}
            aria-label={`${field.label}拾色器`}
            onChange={event => preview.changeToken(field.token, event.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded border bg-card p-1"
          />
        )}
        <Input id={id} value={value} placeholder={baseline} onChange={event => preview.changeToken(field.token, event.target.value)} aria-invalid={invalid || undefined} aria-describedby={`${id}-hint`} autoComplete="off" spellCheck={false} />
      </div>
      <p id={`${id}-hint`} className={invalid ? 'text-xs text-destructive' : 'truncate text-xs text-muted-foreground'} title={baseline}>
        {invalid ? `无效的 ${field.property} 值，预览暂用项目值` : `${field.token} · 项目值：${baseline}`}
      </p>
    </div>
  );
}
export default function PreviewPanel({ preview, compact = false }) {
  const importInput = useRef(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [copyText, setCopyText] = useState('');
  const blocked = preview.invalid.length > 0;
  const serialized = () => JSON.stringify(preview.copyConfig(), null, 2);
  return (
    <section className={compact ? 'space-y-4' : 'ds-panel space-y-4 p-[var(--panel-space)]'} aria-label="样式微调">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">样式微调</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">调整即时预览，点击底部“保存到项目”才写入源码。留空跟随项目值；保存空值会移除该项已保存的覆盖。预设、浅深色与密度分别记录。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={blocked}
            onClick={() => {
              try {
                preview.stash();
                toast.success('预览已暂存，重新进入或刷新可恢复');
              } catch {
                toast.error('浏览器存储不可用，可复制当前调整进行备份');
              }
            }}
          >
            <Save />
            暂存调整
          </Button>
          <Button variant="outline" size="sm" disabled={!preview.canUndo} onClick={preview.undo}>
            <Undo2 />
            撤销调整
          </Button>
          <Button variant="outline" size="sm" onClick={preview.restore}>
            <RotateCcw />
            恢复项目配置
          </Button>
          <input
            ref={importInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="导入项目设计配置文件"
            onChange={async event => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              setImporting(true);
              setImportError('');
              try {
                if (file.size > 65536) throw new Error('配置文件不能超过 64 KB');
                let config;
                try {
                  config = JSON.parse(await file.text());
                } catch {
                  throw new Error('无法解析 JSON 配置文件');
                }
                preview.importConfig(config);
                toast.success('已导入预览，点击“保存到项目”后才会写入源码');
              } catch (error) {
                setImportError(error.message || '导入失败，当前预览未改变');
              } finally {
                setImporting(false);
              }
            }}
          />
          <Button variant="outline" size="sm" disabled={preview.saving || importing} onClick={() => importInput.current?.click()}>
            <Upload />
            {importing ? '导入中…' : '导入 JSON'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={preview.saving}
            onClick={async () => {
              try {
                const saved = await preview.exportConfig();
                const url = URL.createObjectURL(new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }));
                const link = document.createElement('a');
                link.href = url;
                link.download = 'project-design.json';
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                toast.success('已导出项目已保存配置，不包含未保存调整');
              } catch (error) {
                toast.error(error.message || '导出失败');
              }
            }}
          >
            <Download />
            导出 JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={blocked}
            onClick={async () => {
              const text = serialized();
              try {
                await navigator.clipboard.writeText(text);
                toast.success('配置已复制，可粘贴给任意 AI Agent 修改对应 Token');
              } catch {
                setCopyText(text);
              }
            }}
          >
            <Copy />
            复制给 AI Agent
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">导出仅包含项目已保存配置。导入将完整恢复到预览，保存后会替换全部已保存的 Token 覆盖；可撤销导入或恢复项目配置。</p>
      {importError && (
        <p role="alert" className="text-sm text-destructive">
          {importError}
        </p>
      )}
      <p className="text-xs text-muted-foreground">输入 CSS 值，例如 #2563eb、oklch(0.6 0.2 260)、14px、400、1.5、0 2px 8px #0002。颜色请同时检查对应文字的对比度。</p>
      {blocked && (
        <p role="alert" className="text-sm text-destructive">
          有 {preview.invalid.length} 个无效 Token 值，请修正后暂存或保存。
        </p>
      )}
      <div className="divide-y rounded-lg border">
        {FIELD_GROUPS.map(group => (
          <details key={group.title} className="p-4">
            <summary className="cursor-pointer text-sm font-medium">{group.title}</summary>
            <div className={compact ? 'mt-5 grid gap-5' : 'mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3'}>
              {group.fields.map(field => (
                <TokenField key={field.token} field={field} preview={preview} />
              ))}
            </div>
          </details>
        ))}
      </div>
      <Dialog
        open={!!copyText}
        onOpenChange={open => {
          if (!open) setCopyText('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动复制配置</DialogTitle>
            <DialogDescription>剪贴板权限不可用，请选择以下 JSON 并复制给 AI Agent。</DialogDescription>
          </DialogHeader>
          <Label htmlFor="preview-copy">预览配置 JSON</Label>
          <Textarea id="preview-copy" value={copyText} readOnly rows={12} onFocus={event => event.target.select()} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
