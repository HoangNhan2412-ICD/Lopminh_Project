import {readFile,readdir} from 'node:fs/promises';
import {documentSchema,textbookSchema} from '../src/content/thu-vien/schema.ts';
const docs=JSON.parse(await readFile(new URL('../src/content/thu-vien/van-ban.json',import.meta.url),'utf8'));
for(const d of docs)documentSchema.parse(d);
const dir=new URL('../src/content/thu-vien/sgk/',import.meta.url);
const files=(await readdir(dir)).filter(f=>f.endsWith('.json'));
for(const file of files)textbookSchema.parse(JSON.parse(await readFile(new URL(file,dir),'utf8')));
console.log(`Định dạng hợp lệ: ${docs.length} văn bản, ${files.length} tệp mục lục. Đây không phải xác nhận nội dung hoặc hiệu lực.`);
