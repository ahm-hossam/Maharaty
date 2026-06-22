'use client'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  size?: 'sm' | 'md' | 'lg'
}

export function Toggle({ checked, onChange, size = 'md' }: ToggleProps) {
  const dim = {
    sm: { track: 'h-5 w-9',  knob: 'h-3.5 w-3.5', on: 'left-[18px]', off: 'left-[3px]' },
    md: { track: 'h-6 w-11', knob: 'h-4 w-4',     on: 'left-[23px]', off: 'left-[3px]' },
    lg: { track: 'h-7 w-14', knob: 'h-5 w-5',     on: 'left-[29px]', off: 'left-[3px]' },
  }[size]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      dir="ltr"
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 ${dim.track} rounded-full cursor-pointer transition-colors duration-200 focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 ${dim.knob} rounded-full bg-white shadow-md transition-all duration-200 ${checked ? dim.on : dim.off}`}
      />
    </button>
  )
}
