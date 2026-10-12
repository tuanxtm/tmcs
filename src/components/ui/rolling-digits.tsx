export function RollingDigits({ value }: { value: number | string }) {
  const text = typeof value === 'number' ? String(value).padStart(2, '0') : value

  return (
    <span className="inline-flex leading-none tabular-nums" aria-hidden="true">
      {text.split('').map((character, index) =>
        /[0-9]/.test(character) ? (
          <span key={index} className="inline-block h-[1em] overflow-hidden">
            <span
              className="flex flex-col transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: `translateY(${-Number(character) * 10}%)` }}
            >
              {'0123456789'.split('').map((digit) => (
                <span key={digit} className="h-[1em]">
                  {digit}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={index}>{character}</span>
        ),
      )}
    </span>
  )
}
