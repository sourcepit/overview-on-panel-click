import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import Clutter from 'gi://Clutter';

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

                    // Unfortunately, in Gnome (with Wayland?), it's not possible to receive
                    // left-clicks on an empty space in the panel when a window is currently
                    // maximized. The events are sent to the maximized window. This is a design
                    // decision by Gnome to enable various features, such as shrinking maximized
                    // windows using the panel. As a workaround, this extension implements a
                    // right-left-click workflow that is intended to integrate with Gnome's
                    // behavior.
                    if (overviewVisible && button === Clutter.BUTTON_PRIMARY) {
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
