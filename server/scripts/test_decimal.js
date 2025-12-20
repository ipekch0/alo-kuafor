const { Decimal } = require('@prisma/client/runtime/library');

const d = new Decimal('123.45');
console.log('Decimal:', d);
console.log('Type:', typeof d);
console.log('Number(d):', Number(d));
console.log('parseFloat(d):', parseFloat(d));
console.log('d.toNumber():', d.toNumber());
console.log('d.toString():', d.toString());
console.log('Number(d.toString()):', Number(d.toString()));
