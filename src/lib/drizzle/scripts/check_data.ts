import { db } from '../index';
import { muridTable } from '../schema';

async function check() {
    const data = await db.select({
        id: muridTable.id,
        nama: muridTable.nama,
        alamat: muridTable.alamat,
        deskelId: muridTable.deskelId
    }).from(muridTable).limit(5);
    console.log(JSON.stringify(data, null, 2));
}

check().catch(console.error);
