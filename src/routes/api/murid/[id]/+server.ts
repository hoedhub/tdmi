import { json } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { eq, and, SQL, sql, aliasedTable } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { Buffer } from 'node:buffer';

type MuridProfile = {
    murid: InferSelectModel<typeof muridTable>;
    deskel: string | null;
    kecamatan: string | null;
    kokab: string | null;
    propinsi: string | null;
    muhrim: { id: number; nama: string } | null;
    mursyid: { id: number; nama: string } | null;
    baiat: { id: number; nama: string } | null;
};

function calculateAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export async function GET({ params }) {
    try {
        const muridId = Number(params.id);

        // Create aliased tables for self-referencing joins
        const muhrimAls = aliasedTable(muridTable, 'muhrim');
        const mursyidAls = aliasedTable(muridTable, 'mursyid');
        const baiatAls = aliasedTable(muridTable, 'baiat');

        const result = await db.select({
            murid: muridTable,
            deskel: deskelTable.deskel,
            kecamatan: kecamatanTable.kecamatan,
            kokab: kokabTable.kokab,
            propinsi: propTable.propinsi,
            muhrim: {
                id: muhrimAls.id,
                nama: muhrimAls.nama
            },
            mursyid: {
                id: mursyidAls.id,
                nama: mursyidAls.nama
            },
            baiat: {
                id: baiatAls.id,
                nama: baiatAls.nama
            }
        })
            .from(muridTable)
            .leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
            .leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
            .leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
            .leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
            .leftJoin(muhrimAls, eq(muridTable.muhrimId, muhrimAls.id))
            .leftJoin(mursyidAls, eq(muridTable.mursyidId, mursyidAls.id))
            .leftJoin(baiatAls, eq(muridTable.baiatId, baiatAls.id))
            .where(eq(muridTable.id, muridId))
            .limit(1);

        const profiles = result as MuridProfile[];

        if (!profiles.length) {
            return json({ error: 'Murid not found' }, { status: 404 });
        }

        const profile = profiles[0];
        const age = calculateAge(profile.murid.tglLahir);

        // Handle binary data conversion properly
        let fotoBase64 = null;
        if (profile.murid.foto) {
            // Convert the Uint8Array to Buffer properly
            const uint8Array = new Uint8Array(profile.murid.foto as unknown as ArrayBuffer);
            const buffer = Buffer.from(uint8Array);
            fotoBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }

        return json({
            success: true,
            data: {
                ...profile.murid,
                age,
                foto: fotoBase64,
                alamatLengkap: [
                    profile.deskel,
                    profile.kecamatan,
                    profile.kokab,
                    profile.propinsi
                ].filter(Boolean).join(', '),
                muhrim: profile.muhrim,
                mursyid: profile.mursyid,
                baiat: profile.baiat
            }
        });
    } catch (error) {
        console.error('Error fetching murid profile:', error);
        return json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
