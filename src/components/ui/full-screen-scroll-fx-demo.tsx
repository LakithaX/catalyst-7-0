import React from "react";
import { FullScreenScrollFX, FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";

const sections = [
  {
    leftLabel: "Silence",
    title: "Silence",
    rightLabel: "Silence",
    background: "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.jpg",
  },
  {
    leftLabel: "Essence",
    title: "Stillness",
    rightLabel: "Essence",
    background: "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.jpg",
  },
  {
    leftLabel: "Rebirth",
    title: "Growth",
    rightLabel: "Rebirth",
    background: "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.jpg",
  },
  {
    leftLabel: "Change",
    title: "Opportunity",
    rightLabel: "Change",
    background: "/assets/catalyst-gallery/616938786_1268082428699001_1398486345666317073_n.jpg",
  },
];

export default function FullScreenScrollFXDemo() {
  const apiRef = React.useRef<FullScreenFXAPI>(null);

  return (
    <div className="w-full">
      <FullScreenScrollFX
        sections={sections}
        header={<><div>The Creative</div><div>Process</div></>}
        footer={<div></div>}
        showProgress
        durations={{ change: 0.7, snap: 800 }}
        colors={{
          text: "#FFFFFF",
          overlay: "rgba(14, 17, 24, 0.45)",
          pageBg: "#F8F3E9",
          stageBg: "#141210",
        }}
      />
    </div>
  );
}
