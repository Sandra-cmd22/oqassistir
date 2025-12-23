import svgPaths from "./svg-6v4m5lj9ow";
import imgFrame13 from "figma:asset/d763162ca6fb9eeff5b6c29af26fa254ae29f177.png";

function Frame() {
  return (
    <div className="content-stretch flex h-[48px] items-center justify-center px-[23px] py-[2px] relative rounded-[5px] shrink-0 w-[252px]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[5px]">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover opacity-60 rounded-[5px] size-full" src={imgFrame13} />
        <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0 rounded-[5px]" />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[5px]" />
      <p className="font-['Heyam:Regular','Noto_Sans:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        Começar
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-center relative shrink-0 w-full">
      <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#989898] text-[16px] w-[245px]">venha conhecer os próximos lançamentos</p>
      <Frame />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[33px] top-[486.11px] w-[327px]">
      <Frame1 />
    </div>
  );
}

function Group() {
  return (
    <div className="h-[73.569px] relative w-[201.231px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 201.231 73.5693">
        <g id="Group 2">
          <rect fill="var(--fill-0, white)" height="29.0146" id="Rectangle 14" transform="matrix(0.988047 -0.154154 0.115398 0.993319 0 37.9002)" width="200.276" />
          <path d={svgPaths.p9321800} fill="var(--fill-0, black)" id="Rectangle 15" />
          <path d={svgPaths.p23850b60} fill="var(--fill-0, black)" id="Rectangle 16" />
          <path d={svgPaths.p1acd3f80} fill="var(--fill-0, black)" id="Rectangle 17" />
          <path d={svgPaths.p26748f80} fill="var(--fill-0, black)" id="Rectangle 18" />
          <path d={svgPaths.p160e7e00} fill="var(--fill-0, black)" id="Rectangle 19" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(16.67%+27.5px)] top-[267px]">
      <div className="absolute flex h-[103.463px] items-center justify-center left-[calc(16.67%+27.5px)] top-[267px] w-[210.111px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[351.208deg]">
          <Group />
        </div>
      </div>
      <p className="absolute font-['Heyam:Regular',sans-serif] leading-[normal] left-[calc(16.67%+39.5px)] not-italic text-[0px] text-nowrap text-white top-[366.11px]">
        <span className="text-[100px]">A</span>
        <span className="text-[50px]">ssistir</span>
      </p>
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-gradient-to-b from-[#000000] from-[26.442%] relative size-full to-[#131215] to-[73.077%] via-[#251c2a] via-[60.096%]" data-name="iPhone 14 & 15 Pro - 3">
      <p className="absolute font-['Heyam:Regular',sans-serif] leading-[normal] left-[calc(33.33%+22px)] not-italic text-[#8e61ff] text-[80px] text-nowrap top-[362.11px]">Oq</p>
      <Frame2 />
      <Group1 />
    </div>
  );
}