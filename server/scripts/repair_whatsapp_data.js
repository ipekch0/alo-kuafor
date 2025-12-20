const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function repair() {
    const salons = await prisma.salon.findMany({
        where: {
            whatsappAPIToken: { not: null },
            whatsappPhoneId: null
        }
    });

    console.log(`Found ${salons.length} salons to repair.`);

    for (const salon of salons) {
        console.log(`Repairing Salon ${salon.id} (${salon.name})...`);
        const token = salon.whatsappAPIToken;

        try {
            // 1. Inspect Token via debug_token to find restricted WABA ID
            const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${token}&access_token=${token}`;

            console.log('Fetching debug info...');
            const res = await axios.get(debugUrl);
            const data = res.data.data;

            // console.log('Debug Token Data:', JSON.stringify(data, null, 2));

            let wabaId = null;

            // Try Granular Scopes
            if (data.granular_scopes) {
                const scope = data.granular_scopes.find(s => s.scope === 'whatsapp_business_management');
                if (scope && scope.target_ids) {
                    wabaId = scope.target_ids[0];
                }
            }

            if (wabaId) {
                console.log(`Found WABA ID from Token: ${wabaId}`);
                // Now fetch phone numbers
                const phoneUrl = `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${token}`;
                const phoneRes = await axios.get(phoneUrl);

                if (phoneRes.data.data && phoneRes.data.data.length > 0) {
                    const phoneId = phoneRes.data.data[0].id;
                    console.log(`Found Phone ID: ${phoneId}`);

                    await prisma.salon.update({
                        where: { id: salon.id },
                        data: {
                            whatsappPhoneId: phoneId,
                            whatsappBusinessId: wabaId
                        }
                    });
                    console.log('✅ REPAIR SUCCESSFUL! Database updated.');
                } else {
                    console.error('No phone numbers found for this WABA.');
                }
            } else {
                console.error('Could not find WABA ID in granular_scopes.');
            }

        } catch (error) {
            console.error(`Error repairing salon ${salon.id}:`, error.response?.data || error.message);
        }
    }
}

repair()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
