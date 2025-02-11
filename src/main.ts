import { Plugin } from 'obsidian';
import { SidebarWidthPluginSettings, DEFAULT_SETTINGS, SidebarWidthSettingTab } from './settings';

function normalizeToPixels(width: string)  {
    let widthPx = 0;
    if (width.endsWith('%')) {
        const percentage = parseFloat(width);
        widthPx = window.innerWidth * (percentage / 100);
    } else {
        widthPx = parseFloat(width);
    }
    return widthPx;
}

export default class SidebarWidthPlugin extends Plugin {
    settings: SidebarWidthPluginSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SidebarWidthSettingTab(this.app, this));

        this.addCommand({
            id: 'increase-left-sidebar-width',
            name: 'Increase left sidebar width',
            callback: () => this.adjustSidebarWidth('.workspace-split.mod-left-split', this.settings.increment, 'left'),
        });

        this.addCommand({
            id: 'decrease-left-sidebar-width',
            name: 'Decrease left sidebar width',
            callback: () => this.adjustSidebarWidth('.workspace-split.mod-left-split', `-${this.settings.increment}`, 'left'),
        });

        this.addCommand({
            id: 'increase-right-sidebar-width',
            name: 'Increase right sidebar width',
            callback: () => this.adjustSidebarWidth('.workspace-split.mod-right-split', this.settings.increment, 'right'),
        });

        this.addCommand({
            id: 'decrease-right-sidebar-width',
            name: 'Decrease right sidebar width',
            callback: () => this.adjustSidebarWidth('.workspace-split.mod-right-split', `-${this.settings.increment}`, 'right'),
        });

        this.addCommand({
            id: 'toggle-left-sidebar-default',
            name: 'Toggle left sidebar (standard width)',
            callback: () => this.toggleSidebarWidth('.workspace-split.mod-left-split', this.settings.leftSidebarStandardWidth, 'left'),
        });

        this.addCommand({
            id: 'toggle-right-sidebar-default',
            name: 'Toggle right sidebar (standard width)',
            callback: () => this.toggleSidebarWidth('.workspace-split.mod-right-split', this.settings.rightSidebarStandardWidth, 'right'),
        });

        this.addCommand({
            id: 'expand-both-sidebar-widths',
            name: 'Expand both sidebars to standard widths',
            callback: () => this.setBothSidebarWidths(this.settings.leftSidebarStandardWidth, this.settings.rightSidebarStandardWidth),
        });

        this.addCommand({
            id: 'collapse-both-sidebar-widths',
            name: 'Collapse both sidebars',
            callback: () => this.setBothSidebarWidths("0", "0"),
        });
    }

    onunload() {
        // console.log('Unloading SidebarWidthPlugin');
    }

    adjustSidebarWidth(selector: string, adjustment: string, side: 'left' | 'right') {
        const sidebar = document.querySelector(selector);
        const workspace = this.app.workspace;

        if (sidebar) {
            const currentWidth = sidebar.getBoundingClientRect().width;
            let adjustmentPx = normalizeToPixels(adjustment);
            let wVal: number = currentWidth + adjustmentPx;
            if (wVal <= 0) {
                if (side === 'left' && !workspace.leftSplit.collapsed) {
                    workspace.leftSplit.collapse();
                } else if (side === 'right' && !workspace.rightSplit.collapsed) {
                    workspace.rightSplit.collapse();
                }
            } else {
                let newWidth =`${wVal}px`;
                if (side === 'left' && workspace.leftSplit.collapsed) {
                    workspace.leftSplit.expand();
                    newWidth = `${normalizeToPixels(this.settings.leftSidebarStandardWidth)}`;
                } else if (side === 'right' && workspace.rightSplit.collapsed) {
                    workspace.rightSplit.expand();
                    newWidth = `${normalizeToPixels(this.settings.rightSidebarStandardWidth)}`;
                }
                (sidebar as HTMLElement).style.width = newWidth;
            }
        }
    }

    toggleSidebarWidth(selector: string, defaultWidth: string, side: 'left' | 'right') {
        const sidebar = document.querySelector(selector);
        const workspace = this.app.workspace;
        if (sidebar) {
            if (side === 'left') {
                workspace.leftSplit.toggle();
            } else {
                workspace.rightSplit.toggle();
            }
            let newWidth: string = `${normalizeToPixels(defaultWidth)}px`;
            (sidebar as HTMLElement).style.width = newWidth;
        }
    }

    setBothSidebarWidths(leftWidth: string, rightWidth: string) {
        const workspace = this.app.workspace;
        const leftSidebar = document.querySelector('.workspace-split.mod-left-split');
        const rightSidebar = document.querySelector('.workspace-split.mod-right-split');

        if (leftSidebar) {
            if (leftWidth.endsWith('%')) {
                const percentage = parseFloat(leftWidth);
                (leftSidebar as HTMLElement).style.width = `${window.innerWidth * (percentage / 100)}px`;
            } else {
                (leftSidebar as HTMLElement).style.width = leftWidth;
            }
            if (leftWidth !== '0px' && workspace.leftSplit.collapsed) {
                workspace.leftSplit.expand();
            }
        }

        if (rightSidebar) {
            if (rightWidth.endsWith('%')) {
                const percentage = parseFloat(rightWidth);
                (rightSidebar as HTMLElement).style.width = `${window.innerWidth * (percentage / 100)}px`;
            } else {
                (rightSidebar as HTMLElement).style.width = rightWidth;
            }
            if (rightWidth !== '0px' && workspace.rightSplit.collapsed) {
                workspace.rightSplit.expand();
            }
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

