import Widget from "resource:///com/github/Aylur/ags/widget.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";
import { exec, execAsync } from "resource:///com/github/Aylur/ags/utils.js";


const workspacesObj = {
  1: "󰎤",
  2: "󰎧",
  3: "󰎪",
  4: "󰎭",
  5: "󰎱",
  6: "󰊯",
  7: "󰏆",
  8: "",
  9: "",
  10: "󰎅",
};

function sh(cmd) {
  return function() {
    execAsync(['bash', '-c', cmd]);
  }; 
}

const Workspaces = () =>
  Widget.EventBox({
    className: "workspaces",
    onScrollUp: sh('hyprctl dispatch workspace -1'),
    onScrollDown: sh('hyprctl dispatch workspace +1'),
    child: Widget.Box({
      connections: [
        [
          Hyprland,
          (self) => {
            var arr = Array.from(Hyprland.workspaces, (i) => {
              const id = parseInt(i.id);
              return id;
            });
            arr = arr.filter((item) => item > 0 && item <=10);
            arr.sort((a,b)=>{return a-b});
            self.children = arr.map((i) =>
              Widget.Button({
                onClicked: sh(`hyprctl dispatch workspace ${i}`),
                child: Widget.Label(workspacesObj[i]),
                className: Hyprland.active.workspace.id == i ? "focused" : "",
              })
            );
          },
        ],
      ],
    }),
  });

const ClientTitle = () =>
  Widget.Label({
    className: "client-title",
    binds: [["label", Hyprland.active.client, "title", title => {
        if(title.length>=30){
            return title.substring(0,30)+"...";
        }else{
            return title;
        }
    }]],
  });

const memVar = Variable(0, {
  poll: [1000, ["bash", "-c", "free -m |grep -Ei 'Mem|内存'|awk '{print $7}'"]],
});

const Memory = () =>
  Widget.Label({
      className: "memory",
    binds: [
      ["label", memVar, "value", (value) => "󰍛 " + (value/1024).toFixed(1).toString() + "GiB "],
    ],
  });

const tempVar = Variable(0, {
  poll: [1000, ["bash", "-c", "tlp-stat -t |grep temp|awk '{print $4}'"]],
});

const Temperature = () =>
  Widget.Label({
      className: "temperature",
    binds: [
      ["label", tempVar, "value", (value) => " " + value.toString() + "°C"],
    ],
  });

const cpuVar = Variable(0, {
  poll: [
    1000,
    [
      "bash",
      "-c",
      "top -bn 1 | grep '^%Cpu' | tr -d 'usy,' | awk '{print $2 }'",
    ],
  ],
});

const CPU = () =>
  Widget.Label({
      className: "cpu",
    binds: [
      ["label", cpuVar, "value", (value) => "󰻠 " + value.toString() + "% "],
    ],
  });

const Brightness = () =>
  Widget.Box({
    className: "brightness",
    children: [
      Widget.Stack({
        items: [
          ["100", Widget.Label("󰛨")],
          ["90", Widget.Label("󱩖")],
          ["80", Widget.Label("󱩔")],
          ["70", Widget.Label("󱩔")],
          ["60", Widget.Label("󱩓")],
          ["50", Widget.Label("󱩒")],
          ["40", Widget.Label("󱩑")],
          ["30", Widget.Label("󱩐")],
          ["20", Widget.Label("󱩏")],
          ["10", Widget.Label("󱩎")],
          ["0", Widget.Label("󰹐")],
        ],
        connections: [
          [
            1000,
            (self) => {
              execAsync(["brightnessctl", "g"]).then((val) => {
                const show = [100, 90, 90, 70, 60, 50, 40, 30, 20, 10, 0].find(
                  (threshold) => threshold <= parseInt(val) / 1200
                );
                self.shown = `${show}`;
              });
            },
          ],
        ],
      }),
      Widget.EventBox({
        onScrollUp: sh('brightnessctl s +5%'),
        onScrollDown: sh('brightnessctl s 5%-'),
        child: Widget.Label({
          connections: [
            [
              1000,
              (self) =>
                execAsync(["brightnessctl", "g"])
                  .then(
                    (val) =>
                      (self.label = parseInt(parseInt(val) / 1200).toString() + "% ")
                  )
                  .catch(console.error),
            ],
          ],
        }),
      }),
    ],
  });

const Volume = () =>
  Widget.Box({
    className: "volume",
    children: [
      Widget.Stack({
        items: [
          ["101", Widget.Icon("audio-volume-overamplified-symbolic")],
          ["67", Widget.Icon("audio-volume-high-symbolic")],
          ["34", Widget.Icon("audio-volume-medium-symbolic")],
          ["1", Widget.Icon("audio-volume-low-symbolic")],
          ["0", Widget.Icon("audio-volume-muted-symbolic")],
        ],
        connections: [
          [
            Audio,
            (self) => {
              if (!Audio.speaker) return;

              if (Audio.speaker.isMuted) {
                self.shown = "0";
                return;
              }

              const show = [101, 67, 34, 1, 0].find(
                (threshold) => threshold <= Audio.speaker.volume * 100
              );

              self.shown = `${show}`;
            },
            "speaker-changed",
          ],
        ],
      }),
      Widget.EventBox({
        onScrollUp: sh("amixer set Master 5%+ unmute"),
        onScrollDown: sh("amixer set Master 5%- unmute"),
        onMiddleClick: sh("amixer set Master toggle"),
        onPrimaryClick: sh("pavucontrol"),
        child: Widget.Label({
          connections: [
            [
              Audio,
              (self) => {
                self.label =
                   parseInt(Audio.speaker.volume * 100).toString() + "%";
              },
              "speaker-changed",
            ],
          ],
        }),
      }),
    ],
  });

const Clock = () =>
  Widget.Label({
    className: "clock",
    connections: [
      [
        1000,
        (self) =>
          execAsync(["date", "+%m/%d %H:%M:%S"])
            .then((date) => (self.label = date))
            .catch((err) => console.log(err)),
      ],
    ],
  });

const batVar = Variable(0, {
  poll: [60000, ["bash", "-c", "cat /sys/class/power_supply/BAT0/capacity"]],
});

const batStateVar = Variable('FULL', {
    poll: [60000, ["bash", "-c", "cat /sys/class/power_supply/BAT0/status"]],
});

const Battery = () =>
  Widget.Box({
    className: "battery",
    children: [
      Widget.Label({
          binds: [
              ['label', batStateVar, 'value', (value)=>{
                  if(value=="Full"||value=="Charging") return '󰚥 ';
                  else return "󰁹 ";
              }]
          ]
      }),
      Widget.Label({
        binds :[
            ['label', batVar, 'value', (value)=>value.toString()+"%"],
        ], 
      }),
    ],
  });

const SysTray = () =>
  Widget.Box({
      className: "tray",
    connections: [
      [
        SystemTray,
        (self) => {
          self.children = SystemTray.items.map((item) =>
            Widget.Button({
              child: Widget.Icon({ binds: [["icon", item, "icon"]] }),
              onPrimaryClick: (_, event) => item.activate(event),
              onSecondaryClick: (_, event) => item.openMenu(event),
              binds: [["tooltip.markup", item, "tooltip-markup"]],
            })
          );
        },
      ],
    ],
  });

const Left = () =>
  Widget.Box({
    children: [Workspaces(),ClientTitle()],
  });

const Center = () =>
  Widget.Box({
    children: [],
  });

const Right = () =>
  Widget.Box({
    hpack: "end",
    children: [
      Memory(),
      CPU(),
      Temperature(),
      Brightness(),
      Volume(),
      Battery(),
      Clock(),
      SysTray(),
    ],
  });

const Bar = ({ monitor } = {}) =>
  Widget.Window({
    name: `bar-${monitor}`,
    className: "bar",
    monitor: monitor,
    anchor: ["top", "left", "right"],
    exclusive: true,
    layer: "top",
    margins: [5, 12, 0, 12],
    child: Widget.CenterBox({
      startWidget: Left(),
      centerWidget: Center(),
      endWidget: Right(),
    }),
  });

export default {
  style: App.configDir + "/css.css",
  windows: [Bar({ monitor: 0 }), Bar({ monitor: 1 })],
};
