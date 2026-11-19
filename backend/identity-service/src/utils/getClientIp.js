// Lấy địa chỉ IP của client (ưu tiên header x-forwarded-for do API Gateway chuyển tiếp)
function getClientIp(req) {
  const rawIp = String(req.headers['x-forwarded-for'] || req.ip || '');
  return rawIp.split(',')[0].trim().slice(0, 50);
}

module.exports = getClientIp;
