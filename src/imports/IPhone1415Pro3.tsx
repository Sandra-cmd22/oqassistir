import imgFrame13 from "figma:asset/d763162ca6fb9eeff5b6c29af26fa254ae29f177.png";

function Group() {
  return (
    <div className="font-['Heyam:Regular',sans-serif] grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[normal] not-italic place-items-start relative shrink-0">
      <p className="[grid-area:1_/_1] h-[108px] ml-0 mt-0 relative text-[#6416ff] text-[100px] w-[128px]">oq</p>
      <p className="[grid-area:1_/_1] ml-0 mt-[59px] relative text-[36px] text-nowrap text-white">assistir</p>
    </div>
  );
}

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
      <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[normal] min-w-full relative shrink-0 text-[#989898] text-[16px] text-center w-[min-content]">venha conhecer os próximos lançamentos</p>
      <Frame />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[59px] items-center left-[41px] top-[304px] w-[327px]">
      <Group />
      <Frame1 />
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-gradient-to-b from-[#000000] from-[26.442%] relative size-full to-[#131215] to-[73.077%] via-[#251c2a] via-[60.096%]" data-name="iPhone 14 & 15 Pro - 3">
      <Frame2 />
    </div>
  );
}