
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCredentials() {
    const PHONE_ID = '822137460992821';
    const WABA_ID = '1179874353536283';
    const TOKEN = 'EAAZAZAMaAliCIBQNT4XKkgk0gN8VmCQUbn62eaCBwG9ihlXVaL1lFOkO8O9YD3ZAlnVdChXr5WKMZAP0MbjGuLMU0vB5DkDVXD2dvXnOo1RGQVX6jHP0hQPYvIPnGUD3SXAdNwz6GIdGmdkuZA4I9nt4mCpqqwpZA0USZBrpVCfcNxehCAgDhiscenBWLfyqORJ3yGnFU7aM2yGqUHIDc661EYJIVkExqGye6ODHwncrnEC0Ir2pZCZC09OUvVVCcYqzk7VODCexszfNcZAgfTwH8H';

    try {
        console.log('Updating Salon Credentials...');
        // Assuming we are updating the first salon found (or specific owner)
        // Since it's a single user setup mostly, we update the first salon.
        const salon = await prisma.salon.findFirst();

        if (!salon) {
            console.error('No salon found!');
            return;
        }

        await prisma.salon.update({
            where: { id: salon.id },
            data: {
                whatsappPhoneId: PHONE_ID,
                whatsappBusinessId: WABA_ID,
                whatsappAPIToken: TOKEN
            }
        });

        console.log(`SUCCESS: Updated credentials for salon: ${salon.name}`);
        console.log('Phone ID:', PHONE_ID);

    } catch (e) {
        console.error('Error updating credentials:', e);
    } finally {
        await prisma.$disconnect();
    }
}

updateCredentials();
