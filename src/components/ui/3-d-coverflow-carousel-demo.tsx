import React from "react";
import { CoverFlowCarousel } from "@/components/ui/3-d-coverflow-carousel";

export default function CoverFlowCarouselDemo({ active = false }: { active?: boolean }) {
  return (
    <div className="w-full bg-[#F8F3E9]">
      <CoverFlowCarousel active={active} />
    </div>
  );
}