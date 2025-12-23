import clsx from "clsx";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("content-stretch flex flex-col gap-[8px] relative shrink-0 w-[92px]", additionalClassNames)}>
      <div className="bg-[#d9d9d9] h-[135px] rounded-[5px] shrink-0 w-full" />
      <div className="font-['Montserrat:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-nowrap text-white">{children}</div>
    </div>
  );
}
type TextProps = {
  text: string;
  additionalClassNames?: string;
};

function Text({ text, additionalClassNames = "" }: TextProps) {
  return (
    <div className={clsx("absolute bg-[rgba(217,217,217,0.2)] content-stretch flex h-[36px] items-center justify-center py-[8px] rounded-[25px] top-[49px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
      <p className="font-['Montserrat:Light',sans-serif] font-light leading-[normal] relative shrink-0 text-[16px] text-nowrap text-white">{text}</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15px] items-start leading-[normal] left-[16px] text-white top-[607px] w-[362px]">
      <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold relative shrink-0 text-[16px] w-full">Sinopse:</p>
      <p className="font-['Montserrat:Light',sans-serif] font-light relative shrink-0 text-[14px] w-full">Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo, ele deve evitar um futuro terrível que só ele pode prever.</p>
    </div>
  );
}

function Frame1() {
  return (
    <Wrapper additionalClassNames="items-start">
      <p className="mb-0">{`Timothee `}</p>
      <p>C.</p>
    </Wrapper>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[92px]">
      <div className="bg-[#d9d9d9] h-[135px] rounded-[5px] shrink-0 w-full" />
      <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-center text-white w-full">Zendaya</p>
    </div>
  );
}

function Frame3() {
  return (
    <Wrapper additionalClassNames="items-center">
      <p className="mb-0">{`Florence `}</p>
      <p>Pugh</p>
    </Wrapper>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <div className="bg-[#d9d9d9] h-[135px] rounded-bl-[5px] rounded-tl-[5px] shrink-0 w-[61px]" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15px] items-start left-[16px] top-[767px] w-[361px]">
      <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[16px] text-white w-full">Elenco:</p>
      <Frame4 />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white h-[36px] relative rounded-[5px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[10px] py-[8px] relative size-full">
          <p className="font-['Montserrat:Black',sans-serif] font-black leading-[normal] relative shrink-0 text-[#0d0d0e] text-[16px] text-nowrap">15/11/2026</p>
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-[109px]">
      <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[16px] text-white w-full">Duna - Part ll</p>
      <Frame />
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15px] items-center left-[calc(16.67%-3.5px)] top-[108px] w-[271px]">
      <div className="bg-[#d9d9d9] h-[361px] rounded-[10px] shrink-0 w-full" />
      <Frame7 />
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-gradient-to-b from-25% from-[#000000] relative size-full to-[#5f5476]" data-name="iPhone 14 & 15 Pro - 4">
      <Frame6 />
      <Frame5 />
      <Frame8 />
      <Text text="Janeiro" additionalClassNames="left-[18px] px-[25px] w-[111px]" />
      <Text text="Favereiro" additionalClassNames="left-[calc(33.33%+12px)] px-[17px] w-[110px]" />
      <Text text="Março" additionalClassNames="left-[calc(66.67%+5px)] px-[18px] w-[88px]" />
    </div>
  );
}