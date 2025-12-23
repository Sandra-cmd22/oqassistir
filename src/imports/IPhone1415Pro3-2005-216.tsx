import svgPaths from "./svg-fhmnupyzl0";
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
    <div className="relative size-full">
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

function Assistir() {
  return (
    <div className="absolute inset-[61.39%_6.31%_0_6%]" data-name="Assistir">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 184.245 68.25">
        <g id="Assistir">
          <path d={svgPaths.p23382e00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p3f1f2b70} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p8c1a300} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p248fa180} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p160f2300} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p3374db80} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p2aa31900} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p18a19700} fill="var(--fill-0, white)" id="Vector_8" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(16.67%+27.5px)] top-[267px]">
      <div className="absolute h-[176.763px] left-[calc(16.67%+27.5px)] top-[267px] w-[210.111px]">
        <div className="absolute flex inset-[0_0_41.47%_0] items-center justify-center">
          <div className="flex-none h-[73.569px] rotate-[351.208deg] w-[201.231px]">
            <Group />
          </div>
        </div>
        <Assistir />
      </div>
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