export function RankBadge({rank}: {rank: number}) {
  return (
    <div className="w-fit h-12 relative">
      <div className="w-10 h-2 left-0 top-0 absolute bg-[#471b94]" />
      <div className="w-10 h-12 left-[8px] top-0 absolute bg-[#8655fd]" />
      <div className="left-[17px] top-[10px] absolute text-center justify-start text-text-inverted-default text-sm font-semibold font-['Inter'] leading-5 text-white">
        #{rank}
      </div>
      <div className="absolute -bottom-0.75 translate-x-2 h-3 w-10 bg-white [clip-path:polygon(0_0,50%_100%,100%_0)] rotate-180 " />
    </div>
  );
}
