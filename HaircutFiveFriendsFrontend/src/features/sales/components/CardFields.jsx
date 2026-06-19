const EMPTY_CARD = { number: '', name: '', expiry: '', cvv: '' };

export { EMPTY_CARD };

const formatNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ').trim();

const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const CardFields = ({ variant = 'admin', value, onChange }) => {
  const focus  = variant === 'client' ? 'focus:border-[#00D2C4]' : 'focus:border-[#C9A84C]';
  const border = variant === 'client' ? 'border-[#1E1E1E]' : 'border-[#2A2A2A]';
  const accent = variant === 'client' ? 'text-[#00D2C4]' : 'text-[#C9A84C]';
  const input  = `bg-[#111] border ${border} ${focus} rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors w-full`;
  const label  = 'text-[12px] text-[#5A5A5A] font-medium';

  const set = (field, v) => onChange({ ...value, [field]: v });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#1E1E1E] bg-[#0E0E0E] p-4">
      <div className={`flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] ${accent}`}>
        <i className="ti ti-credit-card text-base" aria-hidden="true" />
        Datos de la tarjeta
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor={`card-number-${variant}`}>Número de tarjeta *</label>
        <input
          id={`card-number-${variant}`}
          className={input}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={value.number}
          onChange={(e) => set('number', formatNumber(e.target.value))}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor={`card-name-${variant}`}>Nombre en la tarjeta *</label>
        <input
          id={`card-name-${variant}`}
          className={input}
          autoComplete="cc-name"
          placeholder="Como aparece en la tarjeta"
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={label} htmlFor={`card-expiry-${variant}`}>Vencimiento *</label>
          <input
            id={`card-expiry-${variant}`}
            className={input}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            maxLength={5}
            value={value.expiry}
            onChange={(e) => set('expiry', formatExpiry(e.target.value))}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label} htmlFor={`card-cvv-${variant}`}>CVV *</label>
          <input
            id={`card-cvv-${variant}`}
            className={input}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={value.cvv}
            onChange={(e) => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
          />
        </div>
      </div>
    </div>
  );
};
