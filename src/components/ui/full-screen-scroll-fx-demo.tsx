import React from "react";
import { FullScreenScrollFX } from "@/components/ui/full-screen-scroll-fx";

const sections = [
  {
    leftLabel: "Silence",
    kanji: "静",
    title: "Silence",
    rightLabel: "Silence",
    background: "/assets/catalyst-gallery/616439277_1268082045365706_8706912413091711333_n.webp",
  },
  {
    leftLabel: "Essence",
    kanji: "心",
    title: "Stillness",
    rightLabel: "Essence",
    background: "/assets/catalyst-gallery/617331461_1268082458698998_896025517703704603_n.webp",
  },
  {
    leftLabel: "Rebirth",
    kanji: "生",
    title: "Growth",
    rightLabel: "Rebirth",
    background: "/assets/catalyst-gallery/616529329_1268081438699100_5464235221991506990_n.webp",
  },
  {
    leftLabel: "Change",
    kanji: "変",
    title: "Opportunity",
    rightLabel: "Change",
    background: "/assets/catalyst-gallery/616938786_1268082428699001_1398486345666317073_n.webp",
  },
];

/**
 * `active` must mirror the gallery's `active` flag (HomePage's isLockedToHero) so this
 * section's ScrollTrigger is only created once the page is in normal flow and the
 * gallery's pin spacing already exists.
 */
export default function FullScreenScrollFXDemo({ active = true }: { active?: boolean }) {
  return (
    <div className="w-full">
      <FullScreenScrollFX
        active={active}
        sections={sections}
        header={
          <>
            <div>The Creative</div>
            <div>Process</div>
          </>
        }
        footer={<div></div>}
        showProgress
        durations={{ change: 0.7, snap: 800 }}
        // No cover: the photo is already there as you scroll in
        introColor={null}
        // No ivory fade (it left an empty screen): the last photo just pushes forward,
        // then the section scrolls away and the next one follows right behind it
        outroColor={null}
        outroLength={0.5}
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