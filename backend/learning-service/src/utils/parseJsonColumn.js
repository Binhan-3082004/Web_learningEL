// Cột JSON: MySQL trả về object, còn MariaDB trả về chuỗi nên cần tự parse
const parseJsonColumn = (value) => (typeof value === 'string' ? JSON.parse(value) : value);

module.exports = parseJsonColumn;
