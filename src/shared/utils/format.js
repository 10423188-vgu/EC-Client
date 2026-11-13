export const formatLib = {
  vnd: (n) => Number(n).toLocaleString('vi-VN') + '₫',
  // why: omits the ₫ symbol so controlled inputs can parse the value without stripping it
  vndRaw: (n) => Number(n).toLocaleString('vi-VN'),
  parseVND: (raw) =>
    Number(String(raw).replace(/\./g, '').replace(/\D/g, '')) || 0,
}
