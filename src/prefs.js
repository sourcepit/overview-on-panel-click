'use strict';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import {ClickWorkflow, SettingsKey} from './core.js';

export default class ExamplePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const workflows = [
            {key: ClickWorkflow.RIGHT_CLICK_ONLY, label: 'Right Click Only'},
            {key: ClickWorkflow.RIGHT_LEFT_CLICK, label: 'Right Left Click'},
        ];

        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Settings',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Behavior',
            description:
                "Note: Unfortunately, a 'Left Click Only' workflow is not possible. GNOME forwards left-clicks on empty panel areas to maximized windows, so the extension cannot handle them.",
        });
        page.add(group);

        const keys = workflows.map((option) => option.key);
        const labels = workflows.map((option) => option.label);

        let activeKey = settings.get_string(SettingsKey.CLICK_WORKFLOW);

        let activeIndex = keys.indexOf(activeKey);
        if (activeIndex === -1) {
            activeIndex = 0;
            const invalidKey = activeKey;
            activeKey = keys[activeIndex];
            log(
                `[overview-on-panel-click] WARNING: Unexpected click-workflow setting: "${invalidKey}". Falling back to "${activeKey}".`,
            );
            settings.set_string(SettingsKey.CLICK_WORKFLOW, activeKey);
        }

        const row = new Adw.ComboRow({
            title: 'Click Workflow',
            subtitle: 'Choose your preferred click workflow.',
            model: Gtk.StringList.new(labels),
        });

        row.set_selected(activeIndex);

        row.connect('notify::selected-item', () => {
            const index = row.get_selected();
            const key = keys[index];
            log(
                `[overview-on-panel-click] set '${SettingsKey.CLICK_WORKFLOW}' to ${key}`,
            );
            settings.set_string(SettingsKey.CLICK_WORKFLOW, key);
        });

        group.add(row);

        window._settings = settings;
    }
}
