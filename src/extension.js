import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import {ClickWorkflow, SettingsKey} from './core.js';

class PanelClickToggleExtension extends Extension {
    _clickSignalId = null;

    enable() {
        log(`[overview-on-panel-click] enabling extension ${this.uuid}`);
        const panel = Main.panel;
        this._clickSignalId = panel.connect(
            'button-release-event',
            (_actor, event) => {
                const [stageX, stageY] = event.get_coords();

                // double check if we are the last consumer, e.g. panelActivities doesn't consume
                // the click event
                const targetActor = global.stage.get_actor_at_pos(
                    Clutter.PickMode.REACTIVE,
                    stageX,
                    stageY,
                );
                if (targetActor === panel) {
                    const button = event.get_button();
                    const overviewVisible = Main.overview.visible;

                    const workflow = this.getSettings().get_string(
                        SettingsKey.CLICK_WORKFLOW,
                    );

                    if (workflow === ClickWorkflow.RIGHT_CLICK_ONLY) {
                        if (button === Clutter.BUTTON_SECONDARY) {
                            log(
                                `[overview-on-panel-click] toggling overview with right click (right click only mode, overviewVisible=${overviewVisible})`,
                            );
                            Main.overview.toggle();
                            return Clutter.EVENT_STOP;
                        } else {
                            log(
                                `[overview-on-panel-click] click ignored (button=${button}, overviewVisible=${overviewVisible}, mode=right-click-only)`,
                            );
                        }
                    } else if (workflow === ClickWorkflow.RIGHT_LEFT_CLICK) {
                        if (
                            overviewVisible &&
                            button === Clutter.BUTTON_PRIMARY
                        ) {
                            log(
                                '[overview-on-panel-click] closing overview with left click',
                            );
                            Main.overview.toggle();
                            return Clutter.EVENT_STOP;
                        } else if (
                            !overviewVisible &&
                            button === Clutter.BUTTON_SECONDARY
                        ) {
                            log(
                                '[overview-on-panel-click] opening overview with right click',
                            );
                            Main.overview.toggle();
                            return Clutter.EVENT_STOP;
                        } else {
                            log(
                                `[overview-on-panel-click] click ignored (button=${button}, overviewVisible=${overviewVisible})`,
                            );
                        }
                    } else {
                        return Clutter.EVENT_PROPAGATE;
                    }
                }
                return Clutter.EVENT_PROPAGATE;
            },
        );
        panel.reactive = true;
    }

    disable() {
        log(`[overview-on-panel-click] disabling extension ${this.uuid}`);
        if (this._clickSignalId) {
            Main.panel.disconnect(this._clickSignalId);
        }
    }
}

export {PanelClickToggleExtension as default};
