import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandIdentity from '@/components/BrandIdentity';
import AppLogo from '@/components/AppLogo';
import config, { createConfig } from '@/config';

const original = { ...config.app };
afterEach(() => Object.assign(config.app, original));

describe('品牌统一配置', () => {
  it('默认展示名称与图形，装饰 Logo 不重复朗读', () => {
    const { container } = render(<BrandIdentity />);
    expect(screen.getByText(config.app.title)).toBeVisible();
    expect(container.querySelector('[data-slot="app-logo"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveStyle({ width: '28px', height: '28px' });
  });

  it('配置隐藏图形后仍显示修改后的产品名称', () => {
    config.app.showLogo = false;
    config.app.title = '设备监测管理系统';
    const { container } = render(<BrandIdentity />);
    expect(screen.getByText('设备监测管理系统')).toBeVisible();
    expect(container.querySelector('[data-slot="app-logo"]')).toBeNull();
  });

  it('配置图片与尺寸后复用相同品牌组件', () => {
    config.app.logoSrc = '/branding/company.png';
    config.app.logoSize = 32;
    const { container } = render(<BrandIdentity />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', '/branding/company.png');
    expect(image).toHaveStyle({ width: '32px', height: '32px' });
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByText(config.app.title)).toBeVisible();
  });

  it('独立 Logo 支持名称与尺寸类，显式尺寸也可覆盖', () => {
    const { rerender } = render(<AppLogo label="品牌标志" className="size-6" />);
    expect(screen.getByRole('img', { name: '品牌标志' })).toHaveClass('size-6');
    rerender(<AppLogo label="品牌标志" size={24} />);
    expect(screen.getByRole('img', { name: '品牌标志' })).toHaveStyle({ width: '24px', height: '24px' });
  });

  it.each(['dev', 'staging', 'prod'])('%s 配置共享同一品牌入口', stage => {
    expect(createConfig(stage).app).toEqual(original);
  });
});
